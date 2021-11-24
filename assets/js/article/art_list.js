$(function() {
    var layer = layui.layer;
    var laypage = layui.laypage;


    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date);
        var y = padZero(dt.getFullYear());
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDay());
        
        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    }

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }



    // 定义一个查询的参数对象，将来请求数据的时候
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一条数据
        pagesize: 2, // 每页显示几条数据，默认每夜显示2条
        cate_id: '', // 文章分类的 Id
        state: '', // 文章的发布状态
    };

    initTable();
    initCate();
    
    // 初始化文章的列表
    function initTable() {
        $.ajax({
            method: 'GET',
            url: 'http://api-breakingnews-web.itheima.net/my/article/list',
            headers: {
                Authorization: localStorage.getItem('token') || ''
              },
            data: q,
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！');
                };
                // console.log(res);
                // return layer.msg('获取文章列表成功！');
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
                // 调用渲染分页的方法
                renderPage(res.total);
            }  
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: 'http://api-breakingnews-web.itheima.net/my/article/cates',
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！');
                }
                
                // console.log(res);
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res);
                // console.log(htmlStr);
                $('[name=cate_id]').html(htmlStr);
                // 通知layui重新渲染 UI 结构的表单区域
                layui.form.render();
            }

        })

    };

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault();
        // 获取表单中选中的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id;
        q.state = q.state;
        // 根据最新的筛选条件重新渲染表格的数据
        initTable();
    });

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox',  // 分页容器的 Id
            count: total,  // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发送切换的时候触发 jump 回调
            // 触发 jump 回调的方式有两种
            // 1. 点击页码的时候，会触发 jump 回调
            // 2. 只要点击了 laypage.render() 方法，就会触发 jump 回调
            jump: function(obj, first) {
                // 可以通过 first 的值，来判断是通过哪种方式触发的 jump 回调 
                // 如果 first 的值 为 true，证明是方式2触发的
                // 否则就是 1 触发的
                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr;
                // 把最新的条目数，赋值到 q 这个查询对象的 pagesize 属性中
                q.pagesize = obj.limit;
                // 根据最新的q 获取对应的数据列表，并渲染表格
                // initTable();
                if (!first) {
                    initTable();
                }
            }
        })
    };

    // 通过代理的形式， 为删除按钮绑定点击事件处理函数
    $('tbody').on('click', '.btn-delete', function() {
        // 获取页面上删除按钮的 个数
        var len = $('.btn-delete').length;
        // 获取到文章的 id
        var id = $(this).attr('data-id');
        // 询问用户是否要删除数据
        layer.confirm('确认删除?', {icon: 3, title: '提示'}, function(index) {
            $.ajax({
                method: 'GET',
                url: 'http://api-breakingnews-web.itheima.net/my/article/delete/' + id,
                headers: {
                    Authorization: localStorage.getItem('token') || ''
                },
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败！');
                    };
                    layer.msg('删除成功！');
                    // 当数据删除完成之后，需要判断当前这一页中，是否还有剩余的数据, 如果没有了数据，则让页码值 -1 之后，再重新调用initTable() 方法
                    if (len === 1) {
                        // 如果 len 的值等于1 ，证明删除完成之后，页面上就没有数据了，则需要让页码之减1

                        // 页码值最小必循是 1 
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;

                    }
                    initTable();
                }

            })
            layer.close(index);
        })
    })
})
$(function() {
    var layer = layui.layer;
    var form = layui.form;
    initArtCateList();

    // 渲染文章分类的列表
    function initArtCateList() {
        $.ajax({
            method: 'GET',
            url: 'http://api-breakingnews-web.itheima.net/my/article/cates',
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            success: function(res) {
                // console.log(res);
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
            }
        })
    }

    // 为添加按钮绑定点击事件
    var indexAdd = null;
    $('#btnAddCate').on('click', function() {
        indexAdd = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
          }); 
    });

    // 通过代理的形式，为 form-add 表单绑定 submit 事件
    // 之前表单中不存在 form-add 是我们通过js脚本动态添加的
    $('body').on('submit', '#form-add', function(e) {
        e.preventDefault();
        // console.log('ok');
        $.ajax({
            method: 'POST',
            url: 'http://api-breakingnews-web.itheima.net/my/article/addcates',
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('新增分类失败！');
                };
                // console.log(res);
                initArtCateList();
                layer.msg('新增分类成功！');
                // 根据索引关闭对应的弹出层
                layer.close(indexAdd);
            }

        })
    });


    // 通过代理的形式为编辑按钮绑定点击事件
    var indexEdit = null;
    $('tbody').on('click', '.btn-edit', function() {
        // console.log('ok');
        // 弹出一个修改文章分类信息的层
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
          }); 


        var id = $(this).attr('data-id');
        //   console.log(id);
        // 发起请求获取对应分类的数据
        $.ajax({
            method: 'GET',
            url: 'http://api-breakingnews-web.itheima.net/my/article/cates/' + id,
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            success: function(res) {
                form.val('form-edit', res.data)
            }

        })
    });

    // 通过代理的形式，为修改分类的表单绑定 submit 事件
    $('body').on('submit', '#form-edit', function(e) {
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: 'http://api-breakingnews-web.itheima.net/my/article/updatecate',
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('更新分类信息失败！');
                }
                initArtCateList();
                layer.msg('修改文章分类成功！');
                layer.close(indexEdit);
            }

        })
    });

    var indexDelete = null; 
    // 通过代理的形式为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function() {
        var id = $(this).attr('data-id');
        // 提示用户是否要删除
        layer.confirm('确认删除?', {icon: 3, title:'提示'}, 
        function(index) {
            $.ajax({
                method: 'GET',
                url: 'http://api-breakingnews-web.itheima.net/my/article/deletecate/' + id,
                headers: {
                    Authorization: localStorage.getItem('token') || ''
                },
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除分类失败！');
                    }
                    layer.msg('删除分类成功！');
                    layer.close(index);
                    initArtCateList();
                }
            })
          });
    })


})
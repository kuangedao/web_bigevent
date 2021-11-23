$(function() {
    var form = layui.form;

    // 设置表单的校验规则
    form.verify({
        pwd: [/^[\S]{6,12}$/
        , '密码必须6到12位，且不能出现空格'],
        samePwd: function(value) {
            // 这里的value是从密码框里获取的值
            if (value === $('[name=oldPwd]').val()) {
                return '新旧密码不能相同！';
            }
        },
        rePwd: function(value) {
            if (value !== $('[name=newPwd]').val()) {
                return '两次密码不一致！';
            }
        }
    });

    // 发起ajax请求修改密码
    $('.layui-form').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: 'http://api-breakingnews-web.itheima.net/my/updatepwd',
            headers: {
                Authorization: localStorage.getItem('token') || ''
            },
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layui.layer.msg('更新密码失败！');
                };
                layui.layer.msg('更新密码成功！');
                // 更新密码之后要重置表单
                $('.layui-form')[0].reset();
            }
        })
    })


})
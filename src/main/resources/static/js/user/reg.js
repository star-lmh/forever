layui.config({
    base: '/' //静态资源所在路径
}).extend({
    index: 'lib/index' //主入口模块
}).use(['index', 'user'], function () {
    var $ = layui.$
        , setter = layui.setter
        , admin = layui.admin
        , form = layui.form
        , router = layui.router();

    form.render();

    //自定义验证规则
    form.verify({
        user: [
            /^[a-zA-Z0-9_]{4,16}$/
            , '用户名4到16位(允许包含字母、数字、下划线)'
        ],
        pass: [
            /^[\S]{6,12}$/
            , '密码必须6到12位，且不能出现空格'
        ]
    });

    //提交
    form.on('submit(LAY-user-reg-submit)', function (obj) {
        var field = obj.field;

        //确认密码
        if (field.password !== field.repass) {
            return layer.msg('两次密码输入不一致');
        }

        //是否同意用户协议
        if (!field.agreement) {
            return layer.msg('你必须同意用户协议才能注册');
        }

        //发送激活邮件
        layer.msg('激活邮件发送中，请稍等！', {
            icon : 16,
            time : '-1',
            shade : 0.3
        });
        //请求接口
        admin.req({
            url: '/register' //实际使用请改成服务端真实接口
            , type: 'post'
            , data: field
            , done: function (res) {

                layer.msg('注册成功，请激活登录！', {
                    offset: '15px'
                    , icon: 1
                    , time: 1000
                }, function () {
                    location.hash = '/goLogin'; //跳转到登入页
                });
            }
        });
        return false;
    });
});
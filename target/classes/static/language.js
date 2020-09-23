/**
 * cookie操作
 1.name and value given , set cookie;
 2.name given, value is null, delete cookie;
 3.name given, value is undefined, get cookie;
 */
var getCookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var s = [cookie, expires, path, domain, secure].join('');
        var secure = options.secure ? '; secure' : '';
        var c = [name, '=', encodeURIComponent(value)].join('');
        var cookie = [c, expires, path, domain, secure].join('')
        document.cookie = cookie;
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

/**
 * 获取浏览器语言类型
 * @return {string} 浏览器国家语言
 */
var getNavLanguage = function(){
    if(navigator.appName == "Netscape"){
        var navLanguage = navigator.language;
        return navLanguage.substr(0,2);
    }
    return false;
}

/**
 * 设置语言类型： 默认为浏览器语言
 */

var i18nLanguage = navigator.language||navigator.userLanguage;

/*
设置一下网站支持的语言种类
 */
var webLanguage = ['zh_CN', 'en_US'];

/**
 * 执行页面i18n方法
 * @return
 */
var execI18n = function(){
    /*
        首先获取用户浏览器设备之前选择过的语言类型
     */
    if (getCookie("Language")) {
        i18nLanguage = getCookie("Language");
    } else {
        // 获取浏览器语言
        var navLanguage = getNavLanguage();
        if (navLanguage) {
            // 判断是否在网站支持语言数组里
            var charSize = $.inArray(navLanguage, webLanguage);
            if (charSize > -1) {
                i18nLanguage = navLanguage;
                getCookie("Language",navLanguage,{       // 存到缓存中
                    expires: 30,
                    path:'/'
                });
            };
        } else{
            console.log("not navigator");
            return false;
        }
    }

    /* 需要引入 i18n 文件*/
    if ($.i18n == undefined) {
        console.log("请引入jquery.i18n.properties.js文件")
        return false;
    };

    /*
        这里需要进行i18n的翻译
     */
    jQuery.i18n.properties({
        name: 'message',        //属性文件名 命名格式： 文件名_国家代号.properties
        path: '/messages/',     //注意这里路径是你属性文件的所在文件夹
        mode : 'map',                       //用Map的方式使用资源文件中的值
        language : i18nLanguage,
        cache:false,
        encoding: 'UTF-8',
        callback : function() {             //加载成功后设置显示内容
            $("[data-locale]").each(function () {
                //placeholder 引用中英文
                if ($(this).attr('placeholder')) {
                    $(this).attr('placeholder', $.i18n.prop($(this).data('locale')));
                } else {
                    $(this).html($.i18n.prop($(this).data("locale")));
                }
            });

        }
    });
}

$(function(){

    /*执行I18n翻译*/
    execI18n();

    // 下拉框切换语言，且
    //<select id="language">
    //             <option value="zh_CN">中文简体</option>
    //             <option value="en_US">English</option>
    //         </select>/
    // /*将语言选择默认选中缓存中的值*/
    // $("#language option[value="+i18nLanguage+"]").attr("selected",true);
    //
    // /* 选择语言 */
    // $("#language").on('change', function() {
    //     var language = $(this).children('option:selected').val()
    //     getCookie("Language",language,{
    //         expires: 30,
    //         path:'/'
    //     });
    //     location.reload();
    // });
});
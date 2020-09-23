layui.define(['jquery','layer','element'], function(exports) {
    var $ = layui.$, layer = layui.layer, element = layui.element;

    // 菜单的公共定义样式汇总
    var LI_NAV_ITEM = "layui-nav-item", LI_NAV_THIS = "layui-nav-itemed",
        ICONFONT = "layui-icon",
        DL_NAV_ITEM = "layui-nav-child", DD_THIS = "layui-this";
    //异步加载接口
    var AjaxHelper = {
        request : function(config) {
            var data = config.data ? config.data : {};
            var async = (typeof (config.async) === "boolean") ? config.async : true;
            $.ajax({
                type : config.type ? config.type : "POST",
                headers : config.headers,
                url : config.url,
                dataType : config.dataType ? config.dataType : "json",
                data : data,
                async : async,
                success : config.success,
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    if (typeof (config.error) === "function") {
                        config.error();
                    } else {
                        layer.msg("异步加载失败1： " + textStatus,{icon:5, shift:6});
                    }
                },
                statusCode : {
                    404 : function() {
                        layer.msg('未找到指定请求，请检查访问路径！',{icon:5, shift:6});
                    },
                    500 : function() {
                        layer.msg('系统错误，请联系管理员。',{icon:5, shift:6});
                    }
                },
                complete : function(XMLHttpRequest, textStatus) {
                    if (typeof (config.complete) === "function") {
                        config.complete(XMLHttpRequest, textStatus);
                    }
                }
            });
        },
        serialize: function(param){	//json序列化   key=value&key1=value1
            var p = "?";
            for (var key in param) {
                p += key + "=" + param[key] + "&";
            }
            p = p.substring(0, p.length-1);
            return p;
        }
    };

    var event = {
        getElemId: function (options) {	// 根据传入的参数获取ID
            var elem = options.elem || "";
            var obj = options.obj || $(elem);

            if (obj.length == 0) {	//页面中未找到绑定id
                return "";
            } else {
                return $(obj)[0].id;
            }
        }
    };
    // 菜单类
    var Menu = function(options){
        /** 默认赋值**/
        this.response = {  // 返回的json格式
            statusName: "code",		//返回标识
            statusCode: 0,		    //返回码
            message: "msg",		    //返回信息
            rootName: "data",		//根节点名称
            menuId: "id",			//节点ID
            parentId: "parentId",	//父节点ID
            title: "title",			//节点名称
            iconClass: "iconClass",	//节点图标
            href: "href",	        //节点链接
            tips: "tips"	        //节点副标题
        };

        this.setting(options);
    };

    // 设置值
    Menu.prototype.setting = function(options) {
        this.options = options || {};

        /** 绑定元素参数（必填，2个参数项必填一个）**/
        this.elem = this.options.elem || "";			//树绑定的元素ID：#elem
        this.obj = this.options.obj || $(this.elem);	//菜单绑定的jquery元素，用于当元素是延迟加载出来的话，可以用这个找到

        /** 数据加载参数**/
        this.data = this.options.data || null;		//初始化指定该参数，则不会访问异步接口
        this.url = this.options.url || "";		//请求地址
        this.async = (typeof (this.options.async) === "boolean") ? this.options.async : true;	//异步同步加载,默认异步加载
        this.headers = this.options.headers || {};		// ajax header属性
        this.method = this.options.method || "post";	//请求类型
        this.dataType = this.options.dataType || "json";	//参数类型
        this.request = this.options.request || {};		//用户自定义请求参数
        this.response = $.extend(this.response, this.options.response) || this.response;	//返回json格式
        this.success = this.options.success || function(data, obj){};		//菜单加载完毕后执行解析菜单之前的回调
        this.done = this.options.done || function(data, obj){};		//菜单加载完毕后的回调

        /** 其他参数**/
        this.direction = this.options.direction || "2";     // tips的显示位置
        this.rootUrl = this.options.rootUrl || "";          // 访问链接的根路径
    };
    // 初始化树
    Menu.prototype.init = function(){
        var _this = this;
        if (typeof _this !== "object") {
            layer.msg("组件未成功加载，请检查配置", {icon:5});
            return ;
        }

        if(_this.data) {
            if(typeof _this.data.length === 'undefined'){
                layer.msg("数据解析异常，data数据格式不正确", {icon:5});
                return ;
            }

            //先将ul中的元素清空
            _this.obj.html("");

            setTimeout(function () {
                // 加载完毕后执行菜单解析前的回调
                _this.success(_this.data, _this.obj);

                // 1.识别根节点ul中的data-id标签，判断顶级父节点
                var pid = _this.obj.attr("data-name");
                // 2.构建一个存放节点的树组
                var rootListData = _this.queryListMenuByPid(pid, _this.data);
                _this.loadListMenu(rootListData, _this.data);

                // 加载完毕后的回调
                _this.done(_this.data, _this.obj);
            },100);
        } else {
            if (!_this.url) {
                layer.msg("数据请求异常，url参数未指定", {icon:5});
                return ;
            }

            //先将ul中的元素清空
            _this.obj.html("");

            var index = layer.load(1);

            AjaxHelper.request({
                async: _this.async,
                headers: _this.headers,
                type: _this.method,
                url: _this.url,
                dataType: _this.dataType,
                data: _this.request,
                success: function(result) {
                    if (typeof result === 'string') {
                        result = $.parseJSON(result);
                    }
                    var code = result[_this.response.statusName];

                    if (code == _this.response.statusCode) {
                        // 加载完毕后执行菜单解析前的回调
                        _this.success(result, _this.obj);

                        // 1.识别根节点ul中的data-id标签，判断顶级父节点
                        var pid = _this.obj.attr("data-name");
                        // 2.构建一个存放节点的树组
                        var rootListData = _this.queryListMenuByPid(pid, result[_this.response.rootName]);
                        _this.loadListMenu(rootListData, result[_this.response.rootName]);

                        // 加载完毕后的回调
                        _this.done(result, _this.obj);
                    } else {
                        layer.msg(result[_this.response.message], {icon:2});
                    }
                },
                complete: function(){layer.close(index);}
            });
        }
    };

    // 根据父ID查找list数据中匹配的元素
    Menu.prototype.queryListMenuByPid = function(pid, listData){
        var _this = this;
        var rootListData = [];
        if (listData) {
            for (var i = 0; i < listData.length; i++) {
                var data = listData[i];
                if(typeof data !== "object") continue;
                if(pid == "null" || pid == null){
                    if(data[_this.response.parentId] == null) {
                        rootListData.push(data);
                    }
                } else {
                    if (data[_this.response.parentId] == pid){
                        rootListData.push(data);
                    }
                }
            }
        }
        return rootListData;
    };

    // 加载第一级LI节点
    Menu.prototype.loadListMenu = function(pListData, listData){
        var _this = this;
        if (pListData.length > 0){
            for (var i = 0; i < pListData.length; i++) {
                // 1.获取已知节点的全部数据
                var data = pListData[i];
                if(typeof data !== "object") continue;
                var parseData = _this.parseData(data);
                var childListData = _this.queryListMenuByPid(parseData.menuId(), listData); // 根据已知数据的id判断该条数据是否还有子数据

                // 3. 页面元素加载数据
                $(_this.obj).append(_this.getLiItemDom(parseData.menuId(), parseData.title(),  parseData.iconClass(), parseData.href(), parseData.tips()));

                // 4.有子数据的元素加载子节点
                if(childListData.length > 0){
                    _this.loadListChildDLMenu(childListData, listData, _this.obj.find("li[data-name='"+parseData.menuId()+"']").children("dl"));
                } else {
                    _this.obj.find("li[data-name='"+parseData.menuId()+"']").children("dl").remove();
                }
            }
        }
    };

    // 加载第二~N级DL节点
    Menu.prototype.loadListChildDLMenu = function(childListData, listData, $dl){
        var _this = this;
        if (childListData.length > 0){
            for (var i = 0; i < childListData.length; i++) {
                // 1.获取已知节点的全部数据
                var data = childListData[i];
                if(typeof data !== "object") continue;
                var parseData = _this.parseData(data);
                var childListDlData = _this.queryListMenuByPid(parseData.menuId(), listData); // 根据已知数据的id判断该条数据是否还有子数据
                // 3. 页面元素加载数据
                $dl.append(_this.getDlItemDom(parseData.menuId(), parseData.title(),  parseData.iconClass(), parseData.href(), parseData.tips()));

                // 4.有子数据的元素加载子节点
                if(childListDlData.length > 0){
                    _this.loadListChildDLMenu(childListDlData, listData, $dl.find("dd[data-name='"+parseData.menuId()+"']").children("dl"));
                } else {
                    $dl.find("dd[data-name='"+parseData.menuId()+"']").children("dl").remove();
                }
            }
        }
    };

    // 解析data数据
    Menu.prototype.parseData = function(data) {
        var _this = this;

        return {
            menuId: function(){
                return data[_this.response.menuId];
            },
            parentId: function(){
                return data[_this.response.parentId];
            },
            title: function(){
                return data[_this.response.title] || "";
            },
            iconClass: function(){
                return data[_this.response.iconClass] || "";
            },
            href: function(){
                return data[_this.response.href] || "";
            },
            tips: function(){
                return data[_this.response.tips]  || "";
            }
        }
    };

    // 加载第一级LI节点
    Menu.prototype.getLiItemDom = function(menuId, title, iconClass, href, tips){
        var _this = this;
        var dom = _this.getDom(title, iconClass, href, tips);
        var li = ["<li data-name='" + menuId + "' class='" + LI_NAV_ITEM + "'>", dom.node(), dom.dl(), "</li>"].join("");
        return li;
    };

    // 加载第二~N级DL节点
    Menu.prototype.getDlItemDom = function(menuId, title, iconClass, href, tips){
        var _this = this;
        var dom = _this.getDom(title, iconClass, href, tips);
        var dd = ["<dd data-name='" + menuId + "'>", dom.node(), dom.dl(), "</dd>"].join("");
        return dd;
    };

    // 加载节点内容
    Menu.prototype.getDom = function(title, iconClass, href, tips){
        var _this = this;
        return {
            node: function(){
                var i = (iconClass == null || iconClass == undefined || iconClass == "") ? "" : "<i class='" + ICONFONT + " " + iconClass + "'></i>";
                var cite = "<cite>" + title + "</cite>";

                var layHref = _this.getHref(href);
                var layTips = (tips == null || tips == undefined || tips == "") ? "" : (" lay-tips='" + tips + "' lay-direction='" + _this.direction + "'");
                var a = ["<a href='javascript:;'", layHref, layTips, ">", i, cite, "</a>"].join("");
                return a;
            },
            dl : function(){
                return "<dl class='" + DL_NAV_ITEM + "'></dl>"
            }
        };
    };

    // 加载href内容
    Menu.prototype.getHref = function(href){
        var _this = this;
        if(href == null || href == undefined || href == "") {
            return "";
        } else {
            if(href.indexOf("http") != -1 || href.indexOf("https") != -1) { // 带有http开头的直接返回
                return " lay-href='" + href + "'";
            }
            if("//" == href.substring(0, 2)){   // 双斜杠开头的直接返回
                return " lay-href='" + href + "'";
            }
            return " lay-href='" + _this.rootUrl + href + "'";    // 其他情况则要拼接前缀
        }
    };

    // 初始选中
    Menu.prototype.initChoose = function(id){
        var _this = this;
        var $cThis = _this.obj.find("*[data-name='"+id+"']");
        if($cThis && $cThis.length > 0) {
            $cThis.addClass(DD_THIS);
            _this.upCascade($cThis);
            element.render();
        }
    };

    // 向上递归级联绑定class
    Menu.prototype.upCascade = function($this){
        var _this = this;
        if ($this.parent("dl."+DL_NAV_ITEM).parent("dd[data-name]").length > 0) {
            var $dd = $this.parent("dl."+DL_NAV_ITEM).parent("dd[data-name]");
            $dd.addClass(LI_NAV_THIS);
            _this.upCascade($dd);
        }
        if ($this.parent("dl."+DL_NAV_ITEM).parent("li[data-name]").length > 0) {
            var $li = $this.parent("dl."+DL_NAV_ITEM).parent("li[data-name]");
            $li.addClass(LI_NAV_THIS);
            _this.upCascade($li);
        }
    };
    /** 外部访问 **/
    var menu = {
        render: function (options) {	// 初始化菜单
            var m = null;
            var id = event.getElemId(options);
            if (id == "") {
                layer.msg("页面中未找到绑定id", {icon: 5});
            } else {
                // 创建菜单
                m = new Menu(options);
                m.init();
            }
            return m;
        }
    }
    exports("menu", menu);
});
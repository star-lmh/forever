$(function() {
    layui.config({
        base: '/' //静态资源所在路径
    }).extend({
        index: 'lib/index' //主入口模块
    }).use(['index', 'menu', 'common'], function(){
        var $ = layui.$, menu = layui.menu, element = layui.element;

        var Menu = menu.render({
            elem: '.layui-nav-tree',
            url: "menu/getMenuList2",
            done: function () {
                element.render();
                InitLeftMenu();
            }
        });
    });

    $('#loginOut').click(function() {
        layer.confirm('您确定要退出本次登录吗？', {
            btn : [ '退出', '取消' ]
        }, function() {
            location.href = 'logout';
        }, function(index) {
            layer.close(index);
        });
    })
})

var _menus;
// 初始化左侧
function InitLeftMenu() {
    $.ajax( {
        url : "menu/getMenuList",
        data : {},
        type : 'post',
        async : false,
        timeout : 63000,
        dataType : 'json',
        success : function(data) {
            _menus = data;
        },
        error : function() {
            alert("异常！");
        }
    });

    $.each(_menus.menus, function(i, n) {
        var menulist = '';
        menulist += '<ul>';
        $.each(n.menus, function(j, o) {
            menulist += '<li><div><a id="' + o.menuid + '" onclick="openMenu('
                + o.menuid + ',0)" ref="' + o.menuid + '" rel="' + o.url
                + '" rev="' + o.externalOpen + '" name="' + o.empNo
                + '" shape="' + o.userId + '"><span class="icon ' + o.icon
                + '" >&nbsp;</span><span class="nav">' + o.menuname
                + '</span></a>';
            menulist += '</div></li> ';
        })
        menulist += '</ul>';

        // $('#nav').accordion('add', {
        //     title : n.menuname,
        //     content : menulist,
        //     iconCls : 'icon ' + n.icon
        // });

    });

    $('.easyui-accordion li a').click(function() {
    }).hover(function() {
        $(this).parent().addClass("hover");
    }, function() {
        $(this).parent().removeClass("hover");
    });

    // 选中第一个
    // var panels = $('#nav').accordion('panels');
    // var t = panels[0].panel('options').title;
    // $('#nav').accordion('select', t);
}

function openMenu(menuId, flag) {
    var tabTitle = $("#" + menuId).children('.nav').text();
    var url = $("#" + menuId).attr("rel");
    var menuid = $("#" + menuId).attr("ref");
    var externalOpen = $("#" + menuId).attr("rev");
    var empNo = $("#" + menuId).attr("name");
    var userId = $("#" + menuId).attr("shape");
    var icon = getIcon(menuid);

    if (url.indexOf("WebReport") != -1) {
        url = url + "%26user%3D" + empNo + "%26userId%3D" + userId;
    } else {
        url = url + "?todoFlag=" + flag;
    }
    if (tabTitle == '报价记录审批列表' && document.getElementById("quoteCheck")) {
        document.getElementById("quoteCheck").remove();
    } else if (tabTitle == '客户跟进' && document.getElementById("customerTrack")) {
        document.getElementById("customerTrack").remove();
    }
    if (externalOpen == 'Y') {
        window.open(url);
    } else {
        addTab(tabTitle, url, icon);
        $('.easyui-accordion li div').removeClass("selected");
        $("#" + menuId).parent().addClass("selected");
    }
    addTODOData(menuid, userId);
    addMenuClickLogs(tabTitle);

}

// function addMenuClickLogs(tabTitle) {
//     $.ajax( {
//         url : "menu/addMenuClickLogs",
//         data : {
//             title : tabTitle,
//             type : 0
//         },
//         type : 'post',
//         async : false,
//         timeout : 63000,
//         dataType : 'json',
//         success : function(data) {
//         },
//         error : function(response, ajaxOptions, thrownError) {
//             // Error.displayError(response, ajaxOptions, thrownError);
//         }
//     });
// }

// 获取左侧导航的图标
function getIcon(menuid) {
    var icon = 'icon ';
    $.each(_menus.menus, function(i, n) {
        $.each(n.menus, function(j, o) {
            if (o.menuid == menuid) {
                icon += o.icon;
            }
        })
    })

    return icon;
}

function addTab(subtitle, url, icon) {
    if (!$('#tabs').tabs('exists', subtitle)) {
        $('#tabs').tabs('add', {
            title : subtitle,
            content : createFrame(url),
            closable : true,
            icon : icon
        });
    } else {
        $('#tabs').tabs('select', subtitle);
        $('#mm-tabupdate').click();
    }
    tabClose();
}

function createFrame(url) {
    var s = '<iframe scrolling="auto" frameborder="0"  src="' + url + '" style="width:100%;height:100%;position:relative;"></iframe>';
    return s;
}

function tabClose() {
    /* 双击关闭TAB选项卡 */
    $(".tabs-inner").dblclick(function() {
        var subtitle = $(this).children(".tabs-closable").text();
        $('#tabs').tabs('close', subtitle);
    })
    /* 为选项卡绑定右键 */
    $(".tabs-inner").bind('contextmenu', function(e) {
        $('#mm').menu('show', {
            left : e.pageX,
            top : e.pageY
        });

        var subtitle = $(this).children(".tabs-closable").text();

        $('#mm').data("currtab", subtitle);
        $('#tabs').tabs('select', subtitle);
        return false;
    });
}

function closeTab(subtitle) {
    $('#tabs').tabs('close', subtitle);
}

// 绑定右键菜单事件
function tabCloseEven() {
    // 刷新
    $('#mm-tabupdate').click(function() {
        var currTab = $('#tabs').tabs('getSelected');
        var url = $(currTab.panel('options').content).attr('src');
        $('#tabs').tabs('update', {
            tab : currTab,
            options : {
                content : createFrame(url)
            }
        })
    })
    // 关闭当前
    $('#mm-tabclose').click(function() {
        var currtab_title = $('#mm').data("currtab");
        $('#tabs').tabs('close', currtab_title);
    })
    // 全部关闭
    $('#mm-tabcloseall').click(function() {
        $('.tabs-inner span').each(function(i, n) {
            var t = $(n).text();
            $('#tabs').tabs('close', t);
        });
    });
    // 关闭除当前之外的TAB
    $('#mm-tabcloseother').click(function() {
        $('#mm-tabcloseright').click();
        $('#mm-tabcloseleft').click();
    });
    // 关闭当前右侧的TAB
    $('#mm-tabcloseright').click(function() {
        var nextall = $('.tabs-selected').nextAll();
        if (nextall.length == 0) {
            msgShow('系统提示', '后边没有啦~~', 'error');
            // alert('后边没有啦~~');
            return false;
        }
        nextall.each(function(i, n) {
            var t = $('a:eq(0) span', $(n)).text();
            $('#tabs').tabs('close', t);
        });
        return false;
    });
    // 关闭当前左侧的TAB
    $('#mm-tabcloseleft').click(function() {
        var prevall = $('.tabs-selected').prevAll();
        if (prevall.length == 0) {
            msgShow('系统提示', '前边没有啦~~', 'error');
            return false;
        }
        prevall.each(function(i, n) {
            var t = $('a:eq(0) span', $(n)).text();
            $('#tabs').tabs('close', t);
        });
        return false;
    });

    // 退出
    $("#mm-exit").click(function() {
        $('#mm').menu('hide');
    })
}

/**
 * 待办事项列表
 *
 * @return
 */
// function todoList() {
//     $
//         .ajax( {
//             url : "homePage/getToDoList",
//             data : {},
//             type : 'post',
//             async : false,
//             timeout : 63000,
//             dataType : 'json',
//             success : function(data) {
//                 console.log(data);
//                 if (data.length != 0) {
//                     $("#todoList").empty();
//                     var str = "<div carousel-item>";
//                     for ( var i = 0; i < data.length; i++) {
//                         if (i % 8 == 0) {
//                             str += "<ul class='layui-row layui-col-space10'>"
//                         }
//                         str += ""
//                             + "<li class='layui-col-xs3'>"
//                             + "<a href='javascript:void(0);' onclick='openMenu("
//                             + data[i].menuId
//                             + ",1)' class='layadmin-backlog-body'>"
//                             + "<h3>" + data[i].toDoName + "</h3>"
//                             + "<p><cite style='color: #FF5722;'>"
//                             + data[i].toDoNumber + "</cite></p>"
//                             + "</a></li>"
//                         if (i % 8 == 7) {
//                             str += "</ul>"
//                         }
//                     }
//                     str += "</ul></div>";
//                     $("#todoList").append(str);
//                 } else {
//                     $("#todoList").append("<p>暂无待办提醒！</p>");
//                 }
//             },
//             error : function(response, ajaxOptions, thrownError) {
//             }
//         });
// }

/**
 * 快捷方式列表
 *
 * @return
 */
// function shortcutList() {
//     $
//         .ajax( {
//             url : "homePage/getShortcutList",
//             data : {},
//             type : 'post',
//             async : false,
//             timeout : 63000,
//             dataType : 'json',
//             success : function(data) {
//                 $("#shortcut").empty();
//                 if (data.length != 0) {
//                     var str = '<div carousel-item>' + '<ul class="layui-row layui-col-space10 layui-this">';
//                     for ( var i = 0; i < data.length; i++) {
//                         str += '<li class="layui-col-xs3">'
//                             + '<a href="javascript:void(0);" onclick="openMenu('
//                             + data[i].menuId
//                             + ')">'
//                             + '<i class="layui-icon">&nbsp;<span class="icon '
//                             + data[i].menuIcon + '" >&nbsp;</span></i>'
//                             + '<cite>' + data[i].menuName
//                             + '</cite></a></li>'
//                     }
//                     str += "</ul></div>";
//                     $("#shortcut").append(str);
//                 } else {
//                     $("#shortcut").append("暂未添加快捷方式！");
//                 }
//             },
//             error : function(response, ajaxOptions, thrownError) {
//             }
//         });
// }

/**
 * 最近更新列表
 *
 * @return
 */
// function updateLogList() {
//     $
//         .ajax( {
//             url : "homePage/getUpdateLogList",
//             data : {
//                 number : 4
//             },
//             type : 'post',
//             async : false,
//             timeout : 63000,
//             dataType : 'json',
//             success : function(data) {
//                 if (data.length != 0) {
//                     var str = "";
//                     for ( var i = 0; i < data.length; i++) {
//                         var updateContent = delHtmlTag(data[i].updateContent);
//                         str += '<div class="layui-col-xs3 layui-col-sm3"><div class="layuiadmin-card-text">'
//                             + '<div class="layui-text-top" ><i class="layui-icon layui-icon-water"></i>'
//                             + '<a href="javascript:void(0);" onclick="goUpdateLogDetail('
//                             + data[i].id
//                             + ')">'
//                             + data[i].updateTitle
//                             + '</a>'
//                             + '</div><p title="'
//                             + updateContent
//                             + '" class="layui-text-center">'
//                             + updateContent
//                             + '</p><p class="layui-text-bottom">'
//                             + '<a>'
//                             + data[i].updateType
//                             + '</a><span>'
//                             + data[i].updateDate
//                             + '</span>'
//                             + '</p></div></div>'
//                     }
//                     $("#updateLog").append(str);
//                 } else {
//                     $("#updateLog").append("暂无最近更新！");
//                 }
//             },
//             error : function(response, ajaxOptions, thrownError) {
//             }
//         });
// }

// function defineShortcut() {
//     $('#shortcutDlg').window( {
//         title : "自定义快捷方式",
//         modal : true
//     });
//     $('#shortcutDlg').window('open');
//     loadMenuTree();
// }

// var menuTreeObj;
// function loadMenuTree() {
//     var setting = {
//         check : {
//             enable : true,
//             chkboxType : {
//                 "Y" : "s",
//                 "N" : "s"
//             }
//         },
//         async : {
//             enable : true,
//             url : "menu/getMenuFunctionListByUser", // Ajax 获取数据的 URL 地址
//             autoParam : [ "id" ]
//         },
//         data : {
//             simpleData : {
//                 enable : true
//             }
//         },
//         view : {
//             showIcon : false
//         },
//         callback : {
//             beforeCheck : beforeCheck,
//             onCheck : onCheck,
//             onAsyncSuccess : onAsyncSuccess
//         }
//     };
//
//     menuTreeObj = $.fn.zTree.init($("#menuTree"), setting);
//
//     function onCheck() {
//         nodes = menuTreeObj.getChangeCheckedNodes();
//         for ( var i = 0, l = nodes.length; i < l; i++) {
//             nodes[i].checkedOld = nodes[i].checked;
//             if (nodes[i].checked == true) {
//                 var str = "<li id=" + nodes[i].id + " name=" + nodes[i].name
//                     + " class='ui-state-default'><span class='icon "
//                     + nodes[i].icon + "' >&nbsp;</span>" + nodes[i].name
//                     + "</li>";
//                 $("#sortable").append(str);
//             } else {
//                 $("ul li").remove("li[name=" + nodes[i].name + "]")
//             }
//         }
//     }
//
//     var className = "dark";
//     function beforeCheck(treeId, treeNode) {
//         var checkednodes = menuTreeObj.getCheckedNodes();
//         if (!treeNode.checked) {
//             if (checkednodes.length > 7) {
//                 $.messager.show( {
//                     title : '温馨提示',
//                     msg : '快捷方式最多添加8个'
//                 });
//                 return false;
//             }
//         }
//
//         className = (className === "dark" ? "" : "dark");
//         return (treeNode.doCheck !== false);
//     }
//
//     function onAsyncSuccess(event, treeId, treeNode, msg) {
//         getShortcutMenu();
//         getShortcutSortable();
//     }
// }

// function getShortcutMenu() {
//     var nodes = menuTreeObj.getNodes();
//     for ( var i = 0, l = nodes.length; i < l; i++) {
//         menuTreeObj.setChkDisabled(nodes[i], false, true, true);
//     }
//     menuTreeObj.checkAllNodes(false);
//
//     $.ajax( {
//         url : "homePage/getShortcutList",
//         data : {},
//         type : 'post',
//         async : false,
//         timeout : 63000,
//         dataType : 'json',
//         success : function(data) {
//             for ( var i = 0; i < data.length; i++) {
//                 menuTreeObj.setChkDisabled(menuTreeObj.getNodeByParam("id",
//                     data[i].menuId), false);
//                 menuTreeObj.checkNode(menuTreeObj.getNodeByParam("id",
//                     data[i].menuId), true, false, true);
//             }
//         },
//         error : function(response, ajaxOptions, thrownError) {
//             Error.displayError(response, ajaxOptions, thrownError);
//         }
//     });
// }

// function getShortcutSortable() {
//     $.ajax( {
//         url : "homePage/getShortcutList",
//         data : {},
//         type : 'post',
//         async : false,
//         timeout : 63000,
//         dataType : 'json',
//         success : function(data) {
//             $("#sortable").empty();
//             for ( var i = 0; i < data.length; i++) {
//                 var str = "<li id=" + data[i].menuId + " name="
//                     + data[i].menuName
//                     + " class='ui-state-default'><span class='icon "
//                     + data[i].menuIcon + "' >&nbsp;</span>"
//                     + data[i].menuName + "</li>";
//                 $("#sortable").append(str);
//             }
//         },
//         error : function(response, ajaxOptions, thrownError) {
//             Error.displayError(response, ajaxOptions, thrownError);
//         }
//     });
// }

// function saveShortcut() {
//     var obj = document.getElementById("sortable").getElementsByTagName("li");
//     var columnNames = new Array();
//     var columnIds = new Array();
//     for ( var i = 0; i < obj.length; i++) {
//         var columnName = obj[i].getAttribute("name");
//         var columnId = obj[i].getAttribute("id");
//         columnNames[i] = columnName;
//         columnIds[i] = columnId;
//     }
//     // 数组为[]时，数据传参错误 ，因此用0代替空时顺利进行
//     if (columnNames.length == 0) {
//         columnNames[0] = "0";
//         columnIds[0] = "0";
//     }
//     $.ajax( {
//         url : "homePage/saveShortcut",
//         data : {
//             columnNames : columnNames,
//             columnIds : columnIds
//         },
//         type : 'post',
//         async : false,
//         timeout : 63000,
//         dataType : 'json',
//         success : function(data) {
//             if (data.success) {
//                 $.messager.show( {
//                     title : '温馨提示',
//                     msg : '设置成功!'
//                 });
//                 $('#shortcutDlg').dialog('close');
//                 shortcutList();
//             } else {
//                 $.messager.show( {
//                     title : '系统错误，请联系管理员！',
//                     height : '200px',
//                     width : '300px',
//                     msg : data.errorMsg
//                 });
//             }
//         },
//         error : function() {
//             alert("异常！");
//         }
//     });
// }
//
// function goUpdateLogDetail(id) {
//     window.parent.closeTab("全部更新");
//     window.parent.addTab("全部更新", "homePage/goUpdateLogDetail?id=" + id,
//         "icon icon-upgrade");
// }

// 弹出信息窗口 title:标题 msgString:提示信息 msgType:信息类型 [error,info,question,warning]
function msgShow(title, msgString, msgType) {
    $.messager.alert(title, msgString, msgType);
}

/**
 *
 * 待办数据更新
 *
 * @param menuId
 * @param userId
 * @return
 */
// function addTODOData(menuId, userId) {
//     if (menuId == 188) {
//         $.ajax( {
//             url : "homePage/addHaveTODOData",
//             data : {
//                 menuId : menuId,
//                 userId : userId
//             },
//             type : 'post',
//             async : false,
//             timeout : 63000,
//             dataType : 'json',
//             success : function(data) {
//             },
//             error : function(response, ajaxOptions, thrownError) {
//             }
//         });
//     }
// }

// /**
//  * 创建webSocket
//  */
// function newWebSocket() {
//     var webSocket;
//     if ('WebSocket' in window) {
//         webSocket = new WebSocket(
//             "ws://192.168.10.124:8080/SCM/webSocketServer?user=123");
//     } else if ('MozWebSocket' in window) {
//         webSocket = new MozWebSocket(
//             "ws://192.168.10.124:8080/SCM/webSocketServer");
//     } else {
//         webSocket = new SockJS(
//             "http://192.168.10.124:8080/SCM/sockjs/webSocketServer");
//     }
//
//     // 打开webSocket连接
//     webSocket.onopen = function(evnt) {
//     };
//     // 接收信息
//     webSocket.onmessage = function(evnt) {
//         $.messager.show( {
//             timeout : 0,
//             title : '系统提醒',
//             msg : '服务端推送消息！'
//         });
//     };
//     // 错误处理
//     webSocket.onerror = function(evnt) {
//     };
//     // 关闭webSocket
//     webSocket.onclose = function(evnt) {
//     }
//     return webSocket;
// }

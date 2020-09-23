$(function() {
    loadOrgTree();
    loadRoleTree();
    loadMenuTree();

    $('#dlg').dialog( {
        onClose : function() {
            $("#fm").form("disableValidation");
        }
    })
})

var userId;
var uid;
var orgId;
var roleId;
function userDatagrid(oid, rid) {
    orgId = oid;
    roleId = rid;
    $("#tt").datagrid( {
        height : $("#body").height() - $('#search_area').height() - 5,
        width : $("#body").width(),
        idField : 'id',
        pageSize : 20,
        pageList : [ 20, 40, 60, 80, 100 ],
        url : "user/getAllUser?oid=" + oid + "&rid=" + rid,
        singleSelect : true,
        nowrap : true,
        fitColumns : true,
        rownumbers : true,
        showPageList : false,
        columns : [ [ {
            field : 'username',
            title : '账号',
            width : 100,
            halign : "center",
            align : "center"
        }, {
            field : 'userName',
            title : '姓名',
            width : 100,
            halign : "center",
            align : "center"
        }, {
            field : 'empNo',
            title : '工号',
            width : 100,
            halign : "center",
            align : "center"
        }, {
            field : 'email',
            title : '邮箱',
            width : 180,
            halign : "center",
            align : "center"
        }, {
            field : 'state',
            title : '状态',
            width : 100,
            halign : "center",
            align : "center",
            formatter : function(value, row, index) {
                var str = "";
                if (value == 0) {
                    str = "<span style='color:green'>启用</span>"
                } else {
                    str = "<span style='color:red'>禁用</span>"
                }
                return str;
            }
        } ] ],
        toolbar : '#tt_btn',
        pagination : true,
        onClickRow : function(rowIndex, rowData) {
            userId = rowData.userId;
            uid = rowData.id;
            orgId = rowData.oid;
            getUserMenu(rowData.userId);
            var checkbox = document.getElementById('showRoleMenuCheckBox');
            showRoleMenu(checkbox);
        },
        onDblClickRow : function(rowIndex, rowData) {
            userId = rowData.userId;
            uid = rowData.id;
            orgId = rowData.oid;
            editUser();
        },
        onLoadSuccess : function(data) {
            $('#tt').datagrid('selectRow', 0);
            userId = data.rows[0].userId;
            uid = data.rows[0].id;
            getUserMenu(data.rows[0].userId);
            var checkbox = document.getElementById('showRoleMenuCheckBox');
            showRoleMenu(checkbox);
        }
    });
}

function viewDetail(date, id) {
    $.messager.alert("提示", "查询详细", "info");
}

// 监听窗口大小变化
window.onresize = function() {
    setTimeout(domresize, 300);
};
// 改变表格宽高
function domresize() {
    $('#tt').datagrid('resize', {
        height : $("#body").height() - $('#search_area').height() - 5,
        width : $("#body").width()
    });
}

var url;
var flag = true;
function newUser() {
    $('#dlg').window( {
        title : "新增用户",
        modal : true
    });
    $('#dlg').window('open');
    $('#fm').form('clear');

    $('#oid').combobox( {
        onLoadSuccess : function() {
            var val = $(this).combobox('getData');
            for ( var i = 0; i < val.length; i++) {
                if (val[i].id == orgId) {
                    $('#oid').combobox('select', val[i].id);
                }
            }
        }
    });
    document.getElementById("state1").checked = true;
    flag = true;
    url = 'user/addUser';
}

function editUser() {
    flag = false;
    var row = $('#tt').datagrid('getSelected');
    if (row) {
        $('#dlg').dialog('open').dialog('setTitle', '修改用户');
        $('#fm').form('load', row);

        $('#oid').combobox( {
            onLoadSuccess : function() {
                var val = $(this).combobox('getData');
                for ( var i = 0; i < val.length; i++) {
                    if (val[i].id == orgId) {
                        $('#oid').combobox('select', val[i].id);
                    }
                }
            }
        });
        url = 'user/editUser?id=' + row.id;
    }
}

function saveUser() {
    var message = "";
    var v = $('#oid').combobox('getValue')
    if (flag) {
        url = url + "?oid=" + v + "&rid=" + roleId;
        message = "新增成功!!";
    } else {
        url = url + "&oid=" + v;
        message = "修改成功!!";
    }
    $('#fm').form('submit', {
        url : url,
        onSubmit : function() {
            return $(this).form('enableValidation').form('validate');
        },
        success : function(result) {
            var result = eval('(' + result + ')');
            if (!result.success) {
                $.messager.show( {
                    title : 'Error',
                    msg : result.errorMsg
                });
            } else {
                $('#dlg').dialog('close');
                $('#tt').datagrid('reload');
                $.messager.alert("提示", message);
            }
        }
    });
}

function removeUser() {
    var row = $('#tt').datagrid('getSelected');
    if (row) {
        $.messager.confirm('提示', '确定删除该用户?', function(r) {
            if (r) {
                $.post('user/removeUser', {
                    id : row.id
                }, function(result) {
                    if (result.success) {
                        $('#tt').datagrid('reload');
                    } else {
                        $.messager.show( {
                            title : 'Error',
                            msg : result.msg
                        });
                    }
                }, 'json');
            }
        });
    }
}

function searchByKeyword() {
    $('#tt').datagrid('load', {
        "keyword" : $("#keyword").val()
    });
}

// 按组织机构树
function loadOrgTree() {
    var userTreeObj;
    var rMenu;
    // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
    var setting = {
        view : {
            selectedMulti : false
        },
        async : {
            enable : true,
            url : "user/getOrganizationTree", // Ajax 获取数据的 URL 地址
            autoParam : [ "id" ]
        },
        edit : {
            enable : true,
            showRemoveBtn : false,
            showRenameBtn : false
        },
        data : {
            key : {
                title : "t"
            },
            simpleData : {
                enable : true,
                idKey : "id", // id编号命名
                pIdKey : "pId", // 父id编号命名
                rootId : 0
            }
        },
        callback : {
            beforeAsync : beforeAsync,
            beforeClick : beforeClick,
            onClick : onClick,
            beforeRemove : beforeRemove,
            onRightClick : OnRightClick,
            onAsyncSuccess : onAsyncSuccess,
            beforeRename : zTreeBeforeRename
        },
        view : {
            showIcon : true,
            fontCss : getFontCss
        }
    };

    /**
     * 展开之前执行的函数
     *
     * @param treeId
     * @param treeNode
     * @return
     */
    function beforeAsync(treeId, treeNode) {
    }

    function onAsyncSuccess(event, treeId, treeNode, msg) {
        var treeObj = $.fn.zTree.getZTreeObj(treeId);
        var nodes = treeObj.getNodes();
        if (nodes.length > 0) {
            treeObj.selectNode(nodes[0],false,true);
        }
        userDatagrid(1, 0);
    }

    function beforeClick(treeId, treeNode, clickFlag) {
        return (treeNode.click != false);
    }
    function onClick(event, treeId, treeNode, clickFlag) {
        userDatagrid(treeNode.id, 0);
    }

    function OnRightClick(event, treeId, treeNode) {
        if (!treeNode && event.target.tagName.toLowerCase() != "button"
            && $(event.target).parents("a").length == 0) {
            userTreeObj.cancelSelectedNode();
            showRMenu("root", event.clientX, event.clientY);
        } else if (treeNode && !treeNode.noR) {
            userTreeObj.selectNode(treeNode);
            if (treeNode.isParent) {
                showRMenu("parent", event.clientX, event.clientY);
            } else {
                showRMenu("child", event.clientX, event.clientY);
            }
        }
    }

    function getChildNodes(treeNode) {
        var childNodes = ztree.transformToArray(treeNode);
        var nodes = new Array();
        for (i = 0; i < childNodes.length; i++) {
            nodes[i] = childNodes[i].id;
        }
        return nodes.join(",");
    }

    function showRMenu(type, x, y) {
        $("#rMenu").show();
        if (type == "root") {
            $("#rMenu").hide();
        } else {
            $("#addRole").show();
            $("#editRole").show();
            $("#removeRole").show();
        }
        rMenu.css( {
            "top" : y + "px",
            "left" : x + "px",
            "visibility" : "visible"
        });

        $("body").bind("mousedown", onBodyMouseDown);
    }
    function hideRMenu() {
        if (rMenu)
            rMenu.css( {
                "visibility" : "hidden"
            });
        $("body").unbind("mousedown", onBodyMouseDown);
    }
    function onBodyMouseDown(event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            rMenu.css( {
                "visibility" : "hidden"
            });
        }
    }

    userTreeObj = $.fn.zTree.init($("#treeDemo"), setting);
    rMenu = $("#rMenu");

    $("#expandOrgAllBtn").bind("click", {
        type : "expandAll"
    }, expandNode);
    $("#collapseOrgAllBtn").bind("click", {
        type : "collapseAll"
    }, expandNode);
    $("#refreshOrgBtn").bind("click", refreshOrg);

    function expandNode(e) {
        var zTree = userTreeObj, type = e.data.type, nodes = zTree
            .getSelectedNodes();
        controlTree(zTree, type);
    }

    function refreshOrg() {
        var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
    }

    $("#addOrg").bind("click", {
        isParent : false
    }, addOrg);
    $("#editOrg").bind("click", editOrg);
    $("#removeOrg").bind("click", removeOrg);

    function addOrg(e) {
        var zTree = userTreeObj, isParent = e.data.isParent, nodes = zTree
            .getSelectedNodes(), treeNode = nodes[0];
        add(zTree, isParent, nodes, treeNode);
    }

    function editOrg() {
        var zTree = userTreeObj, nodes = zTree.getSelectedNodes(), treeNode = nodes[0];
        edit(zTree, nodes, treeNode);
    }

    function removeOrg(e) {
        var zTree = userTreeObj, nodes = zTree.getSelectedNodes(), treeNode = nodes[0];
        remove(zTree, nodes, treeNode)
    }

    function beforeRemove(treeId, treeNode) {
        return confirm("确认删除 节点 “" + treeNode.name + "”吗？");
    }
}

var newCount = 1;
var flag = 0;
function add(zTree, isParent, nodes, treeNode) {
    if (treeNode) {
        treeNode = zTree.addNodes(treeNode, {
            id : (100 + newCount),
            pId : treeNode.id,
            iconSkin : "pIcon15",
            name : "新增机构"
        });
    } else {
        treeNode = zTree.addNodes(null, {
            id : (100 + newCount),
            pId : 0,
            iconSkin : "pIcon15",
            isParent : isParent,
            name : "新增机构"
        });
    }
    flag = 1;
    zTree.editName(treeNode[0]);
};

function zTreeBeforeRename(treeId, treeNode, newName, isCancel) {
    var url = "";
    var data;
    if (flag == 1) {
        url = "user/addOrganization";
        data = {
            name : newName,
            parentId : treeNode.pId
        };
    } else if (flag == 2) {
        url = "user/editOrganization";
        data = {
            name : newName,
            id : treeNode.id
        };
    }
    $.ajax( {
        url : url,
        data : data,
        type : 'post',
        async : false,
        timeout : 63000,
        dataType : 'json',
        success : function(data) {
            if (data.success) {
                var treeObj = $.fn.zTree.getZTreeObj(treeId);
                treeObj.reAsyncChildNodes(null, "refresh");
            }
        },
        error : function(response, ajaxOptions, thrownError) {
            Error.displayError(response, ajaxOptions, thrownError);
        }
    });
}

function edit(zTree, nodes, treeNode) {
    if (nodes.length == 0) {
        alert("请先选择一个节点");
        return;
    }
    flag = 2;
    zTree.editName(treeNode);
}

function remove(zTree, nodes, treeNode) {
    var orgNodes = zTree.transformToArray(treeNode);
    var oidArray = new Array();
    for ( var i = 0; i < orgNodes.length; i++) {
        oidArray.push(orgNodes[i].id);
    }
    if (nodes.length == 0) {
        alert("请先选择一个节点");
        return;
    }
    if (treeNode.children && treeNode.children.length > 0) {
        var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
        $.messager.confirm('提示', msg, function(r) {
            if (r) {
                $.ajax( {
                    url : "user/removeOrganization",
                    data : {
                        ids : oidArray.join(",")
                    },
                    type : 'post',
                    async : false,
                    timeout : 63000,
                    dataType : 'json',
                    success : function(data) {
                        if (data.success) {
                            zTree.removeNode(treeNode);
                            $.messager.alert("提示", "操作成功！");
                        } else {
                            $.messager.alert("提示", "部门下存在用户，不能进行删除！", "error");
                        }
                    },
                    error : function(response, ajaxOptions, thrownError) {
                        Error.displayError(response, ajaxOptions, thrownError);
                    }
                });
            }
        });
    } else {
        $.messager.confirm('提示', '确定删除该部门?', function(r) {
            if (r) {
                $.ajax( {
                    url : "user/removeOrganization",
                    data : {
                        ids : oidArray.join(",")
                    },
                    type : 'post',
                    async : false,
                    timeout : 63000,
                    dataType : 'json',
                    success : function(data) {
                        if (data.success) {
                            zTree.removeNode(treeNode);
                            $.messager.show( {
                                title : '温馨提示',
                                msg : '删除成功！'
                            });
                        } else {
                            $.messager.alert("提示", "部门下存在用户，不能进行删除！", "error");
                        }
                    },
                    error : function(response, ajaxOptions, thrownError) {
                        Error.displayError(response, ajaxOptions, thrownError);
                    }
                });
            }
        });
    }
}
/**
 * 组织机构列表树的折叠展开控制
 *
 * @param zTree
 * @param type
 * @return
 */
function controlTree(zTree, type) {
    if (type.indexOf("All") < 0 && nodes.length == 0) {
        alert("请先选择一个父节点");
    }

    if (type == "expandAll") {
        zTree.expandAll(true);
    } else if (type == "collapseAll") {
        zTree.expandAll(false);
    } else {
        for ( var i = 0, l = nodes.length; i < l; i++) {
            zTree.setting.view.fontCss = {};
            if (type == "expand") {
                zTree.expandNode(nodes[i], true, null, null, false);
            } else if (type == "collapse") {
                zTree.expandNode(nodes[i], false, null, null, false);
            } else if (type == "toggle") {
                zTree.expandNode(nodes[i], null, null, null, false);
            } else if (type == "expandSon") {
                zTree.expandNode(nodes[i], true, true, null, false);
            } else if (type == "collapseSon") {
                zTree.expandNode(nodes[i], false, true, null, false);
            }
        }
    }
}

function refreshNode(treeObj) {
    treeObj.reAsyncChildNodes(null, "refresh");
}

// 按角色树
function loadRoleTree() {
    var roleTreeObj;
    // zTree 的参数配置，深入使用请参考 API 文档（setting 配置详解）
    var setting = {
        view : {
            selectedMulti : false
        },
        async : {
            enable : true,
            url : "role/getRoleTree", // Ajax 获取数据的 URL 地址
            autoParam : [ "id" ]
        },
        edit : {
            enable : true,
            showRemoveBtn : false,
            showRenameBtn : false
        },
        data : {
            keep : {
                parent : true,
                leaf : true
            },
            key : {
                title : "t"
            },
            simpleData : {
                enable : true
            }
        },
        callback : {
            beforeClick : beforeClick,
            onClick : onClick,
            beforeRemove : beforeRemove
        }
    };

    function beforeClick(treeId, treeNode, clickFlag) {
        return (treeNode.click != false);
    }
    function onClick(event, treeId, treeNode, clickFlag) {
        userDatagrid(0, treeNode.id);
    }

    roleTreeObj = $.fn.zTree.init($("#treeDemo1"), setting);

    $("#expandRoleAllBtnAct").bind("click", {
        type : "expandAll"
    }, expandNode);
    $("#collapseRoleAllBtnAct").bind("click", {
        type : "collapseAll"
    }, expandNode);

    function expandNode(e) {
        var zTree = roleTreeObj, type = e.data.type, nodes = zTree
            .getSelectedNodes();
        controlTree(zTree, type);
    }

    $("#addRole").bind("click", {
        isParent : false
    }, addRole);
    $("#editRole").bind("click", editRole);
    $("#removeRole").bind("click", removeRole);

    function addRole(e) {
        var zTree = roleTreeObj, isParent = e.data.isParent, nodes = zTree
            .getSelectedNodes(), treeNode = nodes[0];
        add(zTree, isParent, nodes, treeNode);
    }

    function editRole() {
        var zTree = roleTreeObj, nodes = zTree.getSelectedNodes(), treeNode = nodes[0];
        edit(zTree, nodes, treeNode);
    }

    function removeRole(e) {
        var zTree = roleTreeObj, nodes = zTree.getSelectedNodes(), treeNode = nodes[0];
        remove(zTree, nodes, treeNode)
    }

    function beforeRemove(treeId, treeNode) {
        return confirm("确认删除 节点 “" + treeNode.name + "”吗？");
    }
}

var menuTreeObj;
function loadMenuTree() {
    var setting = {
        check : {
            enable : true,
            chkboxType : {
                "Y" : "s",
                "N" : "s"
            }
        },
        async : {
            enable : true,
            url : "menu/getMenuTree?flag=1", // Ajax 获取数据的 URL 地址
            autoParam : [ "id" ]
        },
        data : {
            simpleData : {
                enable : true
            }
        }
    };

    menuTreeObj = $.fn.zTree.init($("#menuTree"), setting);

    $("#expandMenuAllBtn").bind("click", {
        type : "expandAll"
    }, expandNode);
    $("#collapseMenuAllBtn").bind("click", {
        type : "collapseAll"
    }, expandNode);
    $("#refreshMenuBtn").bind("click", refreshMenu);

    function expandNode(e) {
        var zTree = menuTreeObj, type = e.data.type, nodes = zTree
            .getSelectedNodes();
        controlTree(zTree, type);
    }

    function refreshMenu() {
        var treeObj = $.fn.zTree.getZTreeObj("menuTree");
        refreshNode(treeObj);
        setTimeout(function() {
            getUserMenu(userId);
            var checkbox = document.getElementById('showRoleMenuCheckBox');
            showRoleMenu(checkbox);
        }, 500);
    }
}

var userMenuData;
function getUserMenu(userId) {
    // $("#showRoleMenuCheckBox").attr("checked", false);
    var nodes = menuTreeObj.getNodes();
    for ( var i = 0, l = nodes.length; i < l; i++) {
        menuTreeObj.setChkDisabled(nodes[i], false, true, true);
    }
    menuTreeObj.checkAllNodes(false);

    $.ajax( {
        url : "user/selectUserMenu",
        data : {
            userId : userId
        },
        type : 'post',
        async : false,
        timeout : 63000,
        dataType : 'json',
        success : function(data) {
            userMenuData = data;
            for ( var i = 0; i < data.length; i++) {
                menuTreeObj.setChkDisabled(menuTreeObj.getNodeByParam("id",
                    data[i].menuId), false);
                menuTreeObj.checkNode(menuTreeObj.getNodeByParam("id",
                    data[i].menuId), true, false);
            }
        },
        error : function(response, ajaxOptions, thrownError) {
            Error.displayError(response, ajaxOptions, thrownError);
        }
    });
}

function showRoleMenu(t) {
    // var nodes = menuTreeObj.getNodes();
    // for ( var i = 0, l = nodes.length; i < l; i++) {
    // menuTreeObj.setChkDisabled(nodes[i], false, true, true);
    // }
    // menuTreeObj.checkAllNodes(false);
    if (userId == undefined) {
        $.messager.alert("提示", "请先选择用户", "error");
        return;
    }
    $.ajax( {
        url : "user/selectUserRoleMenu",
        data : {
            userId : userId
        },
        type : 'post',
        async : false,
        timeout : 63000,
        dataType : 'json',
        success : function(data) {
            if (t.checked) {
                for ( var i = 0; i < data.length; i++) {
                    menuTreeObj.checkNode(menuTreeObj.getNodeByParam("id",
                        data[i].menuId), true, false);
                    menuTreeObj.setChkDisabled(menuTreeObj.getNodeByParam("id",
                        data[i].menuId), true, true);
                }
            } else {
                getUserMenu(userId);
            }
        },
        error : function(response, ajaxOptions, thrownError) {
            Error.displayError(response, ajaxOptions, thrownError);
        }
    });
}

function saveUserMenu() {
    if (userId == undefined) {
        $.messager.alert("提示", "请先选择用户", "error");
        return;
    }
    $.myloading( {
        title : "正在保存，请稍等...."
    });
    var childNodes = menuTreeObj.getChangeCheckedNodes();
    var nodes = new Array();
    var j = 0;
    for (i = 0; i < childNodes.length; i++) {
        if (childNodes[i].level != 0) {
            nodes[j] = childNodes[i].id;
            j++;
        }
    }
    $.ajax( {
        url : "user/saveUserMenu",
        data : {
            uid : uid,
            mids : nodes.join(",")
        },
        type : 'post',
        async : false,
        timeout : 63000,
        dataType : 'json',
        success : function(data) {
            if (data.success) {
                setTimeout(function() {
                    $.myloading("hide");
                }, 1000 * 1);
            }
        },
        error : function(response, ajaxOptions, thrownError) {
            Error.displayError(response, ajaxOptions, thrownError);
        }
    });
}

function getFontCss(treeId, treeNode) {
    return (!!treeNode.highlight) ? {
        color : "#A60000",
        "font-weight" : "bold"
    } : {
        color : "#333",
        "font-weight" : "normal"
    };
}

var nodeList;
var treeId;
function changeColor(id, key) {
    var value = $("#orgKeyword").val();
    treeId = id;
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    nodeList = treeObj.getNodesByParamFuzzy(key, value);
    resetNodes();
    if (nodeList && nodeList.length > 0) {
        if (value == "") {
            updateNodes(false);
        } else {
            updateNodes(true);
        }
    }
}
function updateNodes(highlight) {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    for ( var i = 0; i < nodeList.length; i++) {
        nodeList[i].highlight = highlight;
        treeObj.updateNode(nodeList[i]);
    }
}

function resetNodes() {
    var treeObj = $.fn.zTree.getZTreeObj(treeId);
    var nodes = treeObj.getNodesByParamFuzzy("name", "");
    for ( var i = 0; i < nodes.length; i++) {
        nodes[i].highlight = false;
        treeObj.updateNode(nodes[i]);
    }
}

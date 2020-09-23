package com.manage.modular.system.controller;

import com.manage.modular.system.pojo.Permission;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.PermissionService;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * 菜单相关
 *
 * @author LiMengHui
 * @Date 2020/5/25
 */
@Controller
@RequestMapping("perm")
public class PermissionController {

    @Autowired
    private PermissionService permService;

    @PostMapping("getMenuList2")
    @ResponseBody
    public String getMenuList2(HttpSession session) {
        User user = (User) session.getAttribute("user");
        JSONArray array = new JSONArray();
        JSONObject result = new JSONObject();
        JSONObject result2 = new JSONObject();

        List<Permission> list = this.permService.getMenuPermissionsByUserId(user.getUsername(), 0L);
        for (Permission menu : list) {
            result.put("id", menu.getId());
            result.put("parentId", "0");
            result.put("title", menu.getName());
            result.put("iconClass", menu.getIcon());
            result.put("href", "");
            array.add(result);
            List<Permission> list2 = this.permService.getMenuPermissionsByUserId(user.getUsername(), menu.getId());
            for (Permission menu2 : list2) {
                result.put("id", menu2.getId());
                result.put("parentId", menu.getId());
                result.put("title", menu2.getName());
                result.put("iconClass", menu2.getIcon());
                result.put("href", menu2.getUrl());
                array.add(result);
                List<Permission> list3 = this.permService.getMenuPermissionsByUserId(user.getUsername(), menu2.getId());
                for (Permission menu3 : list3) {
                    result.put("id", menu3.getId());
                    result.put("parentId", menu2.getId());
                    result.put("title", menu3.getName());
                    result.put("iconClass", menu3.getIcon());
                    result.put("href", menu3.getUrl());
                    array.add(result);
                }
            }
        }
        result2.put("code", "0");
        result2.put("msg", "success");
        result2.put("data", array);
        return result2.toString();
    };


    @RequestMapping("/getMenuList")
    @ResponseBody
    public String getMenuList(HttpSession session) {
        JSONObject result = new JSONObject();
        JSONObject result2 = new JSONObject();

        JSONArray array2 = new JSONArray();

        String userId = (String)session.getAttribute("user");

        List<Permission> list = this.permService.getMenuListByPid(0L);
        for (Permission menu : list) {
            JSONObject result3 = new JSONObject();
            JSONArray array = new JSONArray();

            List<Permission> list2 = permService.getMenuPermissionsByUserId(userId, menu.getId());
            if (list2.size() > 0) {
                result3.put("menuid", menu.getId());
                result3.put("menuname", menu.getName());
                result3.put("icon", menu.getIcon());

                for (Permission menu2 : list2) {
                    result.put("menuid", menu2.getId());
                    result.put("menuname", menu2.getName());
                    result.put("icon", menu2.getIcon());
                    result.put("url", menu2.getUrl());
                    result.put("userId", userId);
                    array.add(result);
                }

                result3.put("menus", array.toString());
                array2.add(result3);
            }
        }
        result2.put("menus", array2);
        return result2.toString();
    }

}

package com.manage.modular.system.controller;

import com.manage.common.result.JSONRuselt;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.UserService;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("goUserList")
    public String goUserList() {
        return "user/user/list";
    }

    @GetMapping("goUserForm")
    public String goUserForm() {
        return "user/user/userform";
    }

    @GetMapping("getUserList")
    @ResponseBody
    public JSONRuselt getUserList(@RequestParam(value = "page", defaultValue = "1") Integer page,
                                  @RequestParam(value = "limit", defaultValue = "30") Integer limit,
                                  @ModelAttribute("field") User field){
        JSONRuselt result = this.userService.queryUserList(page, limit, field);
        if (CollectionUtils.isEmpty((List)result.getData())){
            return JSONRuselt.notFound();
        }
        return result;
    }

}

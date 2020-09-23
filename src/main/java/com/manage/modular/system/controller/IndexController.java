package com.manage.modular.system.controller;

import com.google.code.kaptcha.Constants;
import com.google.code.kaptcha.Producer;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.UserService;
import net.sf.json.JSONObject;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.imageio.ImageIO;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.awt.image.BufferedImage;
import java.io.IOException;

/**
 * 规范：所有静态界面的跳转前面加go
 *
 * @author LiMengHui
 * @Date 2020/5/16
 */
@Controller
public class IndexController {

    @Autowired
    private UserService userService;

    @Autowired
    private Producer producer;

    @GetMapping("role/goRole")
    public String goRole() {
        return "user/administrators/role";
    }

    @GetMapping("go403")
    public String go403() {
        return "template/tips/403";
    }

    @GetMapping("home/console")
    public String console(){

        return "home/console";
    }

    @GetMapping("login")
    public String login() {
        return "user/login";
    }

    @GetMapping("goRegister")
    public String goRegister() {
        return "user/reg";
    }

    @GetMapping("index")
    public String index(HttpSession session, Model model){
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "login";
        }
        return "index";
    }

//    @PostMapping("login")
//    @ResponseBody
//    public String login(HttpSession session , @RequestParam("vercode") String vercode,
//                        @RequestParam("username") String username, @RequestParam("password") String password) {
//        JSONObject obj = new JSONObject();
//        User u = this.userService.getUserByUsername(username);
//        if (u != null) {
//            password = new Md5Hash(password, u.getSalt(), 2).toString();
//        }
//        // 1、提交主体和凭证
//        AuthenticationToken token = new UsernamePasswordToken(username, password);
//        // 2、获取当前主题
//        Subject subject = SecurityUtils.getSubject();
//        // 3、登录
//        try {
//            subject.login(token);
//            User user = (User) subject.getPrincipal();
//            session.setAttribute("user", user);
//        } catch (Exception e) {
//            // 用户名密码错误
//            e.printStackTrace();
//            obj.put("code", "-1");
//            obj.put("msg", "用户名或密码错误！");
//            return obj.toString();
//        }
//        obj.put("code", "0");
//        obj.put("success", true);
//        return obj.toString();
//    }

//    @PostMapping("register")
//    @ResponseBody
//    public Result register(@ModelAttribute("user") User user) {
//        int result = this.userService.register(user);
//        switch (result) {
//            case -1 :
//                // 用户名或者邮箱已被注册
//                return new Result(ResultCode.EXIST);
//            case 1 :
//                // 注册成功
//                return new Result(ResultCode.SUCCESS);
//            default :
//                // 注册失败
//                return new Result(ResultCode.FAIL);
//        }
//    }
    /**
     * 生成验证码
     */
    @RequestMapping("kaptcha")
    public void index(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession();

        response.setDateHeader("Expires", 0);

        // Set standard HTTP/1.1 no-cache headers.
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

        // Set IE extended HTTP/1.1 no-cache headers (use addHeader).
        response.addHeader("Cache-Control", "post-check=0, pre-check=0");

        // Set standard HTTP/1.0 no-cache header.
        response.setHeader("Pragma", "no-cache");

        // return a jpeg
        response.setContentType("image/jpeg");

        // create the text for the image
        String capText = this.producer.createText();

        // store the text in the session
        session.setAttribute(Constants.KAPTCHA_SESSION_KEY, capText);

        // create the image with the text
        BufferedImage bi = this.producer.createImage(capText);
        ServletOutputStream out = null;
        try {
            out = response.getOutputStream();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // write the data out
        try {
            ImageIO.write(bi, "jpg", out);
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            try {
                out.flush();
            } catch (IOException e) {
                e.printStackTrace();
            }
        } finally {
            try {
                out.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }


}

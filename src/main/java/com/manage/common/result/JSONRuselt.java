package com.manage.common.result;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

/**
 * 结果集
 *
 * @author LiMengHui
 * @Date 2020/5/30
 */
@Data
public class JSONRuselt {

    // 定义jackson对象
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // 响应业务状态
    private Integer code;

    // 响应消息
    private String msg;

    // 数据长度
    private Long count;

    // 响应数据
    private Object data;

    public JSONRuselt() {
    }

    public JSONRuselt(Object data) {
        this.code = 0;
        this.msg = "ok";
        this.data = data;
    }

    public JSONRuselt(Integer code, Object data) {
        this.code = code;
        this.data = data;
    }

    public JSONRuselt(Long count, Object data) {
        this.code = 0;
        this.msg = "ok";
        this.count = count;
        this.data = data;
    }

    public JSONRuselt(Integer code, String msg, Long count, Object data) {
        this.code = code;
        this.msg = msg;
        this.count = count;
        this.data = data;
    }

    public static JSONRuselt ok(Object obj){
        return new JSONRuselt(obj);
    }

    public static JSONRuselt notFound(){
        return new JSONRuselt(404, "Not Found");
    }

}


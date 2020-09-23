package com.manage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import tk.mybatis.spring.annotation.MapperScan;

@MapperScan("com.manage.modular.*.mapper")
@SpringBootApplication
public class ForeverApplication {

    public static void main(String[] args) {
        SpringApplication.run(ForeverApplication.class);
    }
}

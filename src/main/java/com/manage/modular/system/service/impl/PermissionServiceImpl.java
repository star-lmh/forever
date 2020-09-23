package com.manage.modular.system.service.impl;

import com.manage.modular.system.mapper.PermissionMapper;
import com.manage.modular.system.pojo.Permission;
import com.manage.modular.system.pojo.User;
import com.manage.modular.system.service.PermissionService;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import tk.mybatis.mapper.entity.Example;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 菜单实现类
 *
 * @author LiMengHui
 * @Date 2020/5/23
 */
@Service
public class PermissionServiceImpl implements PermissionService {

    @Autowired
    private PermissionMapper permissionMapper;

    @Override
    public Set<String> getPermissionByUserId(String userId) {
        Set<String> set = new HashSet<>();
        List<Permission> list = this.permissionMapper.getPermissionByUserId(userId);
        if (!CollectionUtils.isEmpty(list)){
            list.forEach(menu -> {
                if (StringUtils.isNotBlank(menu.getCode())){
                     set.add(menu.getCode());
                }
            });
        }
        return set;
    }

    @Override
    public String getMenuListByUser(User user) {
//            JSONArray array = new JSONArray();
//            JSONObject result = new JSONObject();
//            JSONObject result2 = new JSONObject();

            String userId = user.getUsername();
            return "";

        }

    @Override
    public List<Permission> getMenuPermissionsByUserId(String userId, Long id) {
        List<Permission> menus = this.permissionMapper.getMenuPermissionsByUserId(userId, id);
        return menus;
    }

    @Override
    public List<Permission> getMenuListByPid(Long id) {
        Example example = new Example(Permission.class);
        Example.Criteria criteria = example.createCriteria();
        criteria.andEqualTo("parentId", id);
        criteria.andEqualTo("isDelete", "N");
        criteria.andEqualTo("isVisible", "Y");
        return this.permissionMapper.selectByExample(example);
    }
}

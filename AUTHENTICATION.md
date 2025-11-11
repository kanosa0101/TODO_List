# 用户认证系统文档

## 📋 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [后端实现](#后端实现)
- [前端实现](#前端实现)
- [安全特性](#安全特性)
- [API 文档](#api-文档)
- [使用指南](#使用指南)
- [故障排除](#故障排除)

## 概述

本系统实现了基于 JWT (JSON Web Token) 的用户认证和授权机制，包括：

- ✅ 用户注册和登录
- ✅ 密码 BCrypt 加密存储
- ✅ JWT Token 生成和验证
- ✅ 用户数据隔离
- ✅ 路由保护
- ✅ Token 过期自动处理

## 架构设计

### 认证流程

```
用户登录/注册
    ↓
后端验证（用户名/密码）
    ↓
生成 JWT Token
    ↓
返回 Token 给前端
    ↓
前端存储 Token（localStorage）
    ↓
后续请求自动携带 Token
    ↓
后端验证 Token
    ↓
允许/拒绝访问
```

### 安全架构

```
┌─────────────────┐
│   前端应用      │
│  (React)        │
└────────┬────────┘
         │ HTTP + JWT Token
         ↓
┌─────────────────┐
│  JWT Filter     │ ← 验证 Token
│  (拦截器)        │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Security       │ ← 权限检查
│  Config         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Controller     │ ← 处理请求
│  Service        │
└─────────────────┘
```

## 后端实现

### 1. 用户实体（User）

**位置**: `backend/src/main/java/com/todo/model/User.java`

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(nullable = false, length = 255)
    private String password; // BCrypt加密后的密码
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
```

### 2. JWT 工具类（JwtUtil）

**位置**: `backend/src/main/java/com/todo/util/JwtUtil.java`

**主要功能**:
- 生成 JWT Token
- 验证 Token 有效性
- 提取用户名和用户ID
- 检查 Token 是否过期

**配置**:
```properties
jwt.secret=mySecretKey1234567890123456789012345678901234567890
jwt.expiration=86400000  # 24小时（毫秒）
```

### 3. 认证服务（AuthService）

**位置**: `backend/src/main/java/com/todo/service/AuthService.java`

**功能**:
- 用户注册（用户名/邮箱唯一性验证）
- 用户登录（密码验证）
- 生成 JWT Token

### 4. JWT 认证过滤器（JwtAuthenticationFilter）

**位置**: `backend/src/main/java/com/todo/security/JwtAuthenticationFilter.java`

**工作流程**:
1. 拦截所有请求
2. 从请求头提取 `Authorization: Bearer <token>`
3. 验证 Token 有效性
4. 加载用户信息
5. 设置 Spring Security 认证上下文

### 5. 安全配置（SecurityConfig）

**位置**: `backend/src/main/java/com/todo/config/SecurityConfig.java`

**配置内容**:
- 允许 `/api/auth/**` 无需认证
- 其他所有请求需要认证
- 禁用 CSRF（使用 JWT，无需 CSRF）
- 无状态会话（STATELESS）

### 6. 用户数据隔离

**位置**: `backend/src/main/java/com/todo/service/TodoService.java`

所有待办事项操作都通过 `SecurityUtil.getCurrentUsername()` 获取当前用户，确保：
- 用户只能查看自己的待办事项
- 用户只能操作自己的待办事项
- 创建待办事项时自动关联当前用户

## 前端实现

### 1. 认证服务（authService.js）

**位置**: `frontend/src/services/authService.js`

**功能**:
- `register(username, password, email)` - 用户注册
- `login(username, password)` - 用户登录
- `logout()` - 退出登录
- `getToken()` - 获取 Token
- `getUser()` - 获取用户信息
- `setAuth(token, user)` - 设置认证信息
- `isAuthenticated()` - 检查是否已登录

### 2. 待办事项服务（todoService.js）

**位置**: `frontend/src/services/todoService.js`

**自动添加 Token**:
```javascript
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = authService.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}
```

**Token 过期处理**:
```javascript
function handleResponse(response) {
  if (response.status === 401) {
    authService.logout();
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  // ...
}
```

### 3. 路由保护（ProtectedRoute.jsx）

**位置**: `frontend/src/components/ProtectedRoute.jsx`

未登录用户访问受保护路由时，自动重定向到登录页。

### 4. 登录/注册组件

- **LoginForm.jsx** - 登录表单
- **RegisterForm.jsx** - 注册表单
- **UserMenu.jsx** - 用户菜单（显示用户名、退出登录）

## 安全特性

### 1. 密码加密

- 使用 **BCrypt** 算法加密
- 自动加盐（Salt）
- 不可逆加密

### 2. JWT Token

- **签名算法**: HMAC SHA-256
- **有效期**: 24小时
- **包含信息**: 用户名、用户ID
- **存储位置**: 前端 localStorage

### 3. 用户数据隔离

- 每个用户只能访问自己的数据
- 数据库查询自动过滤用户
- 防止越权访问

### 4. API 权限保护

- 所有待办事项 API 需要认证
- 未认证请求返回 401
- 自动重定向到登录页

### 5. Token 过期处理

- 前端检测 401 状态码
- 自动清除本地存储
- 自动跳转到登录页

## API 文档

### 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "userId": 1
}
```

**错误响应**:
```json
{
  "message": "用户名已存在"
}
```

### 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "userId": 1
}
```

**错误响应**:
```json
{
  "message": "用户名或密码错误"
}
```

### 使用 Token 访问 API

所有需要认证的 API 都需要在请求头中添加 Token：

```http
GET /api/todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 使用指南

### 1. 用户注册

1. 访问 `/register` 页面
2. 填写用户名（3-50字符）、邮箱、密码（至少6字符）
3. 点击"注册"按钮
4. 注册成功后自动登录并跳转到主页

### 2. 用户登录

1. 访问 `/login` 页面
2. 输入用户名和密码
3. 点击"登录"按钮
4. 登录成功后跳转到主页

### 3. 访问受保护页面

- 未登录用户访问主页会自动重定向到登录页
- 已登录用户可以正常访问所有功能

### 4. 退出登录

- 点击右上角用户菜单
- 选择"退出登录"
- 自动清除 Token 并跳转到登录页

## 故障排除

### 问题：登录后仍然提示未登录

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 检查 localStorage 中是否有 `token` 和 `user`
3. 清除浏览器缓存后重新登录
4. 检查 Token 是否过期（默认24小时）

### 问题：401 Unauthorized 错误

**可能原因**:
1. Token 已过期
2. Token 格式错误
3. 请求头未正确添加 Token

**解决方案**:
1. 重新登录获取新 Token
2. 检查请求头格式：`Authorization: Bearer <token>`
3. 检查前端代码是否正确添加 Token

### 问题：无法注册新用户

**可能原因**:
1. 用户名或邮箱已存在
2. 密码不符合要求（至少6字符）
3. 邮箱格式不正确

**解决方案**:
1. 使用不同的用户名和邮箱
2. 确保密码长度至少6字符
3. 检查邮箱格式是否正确

### 问题：用户无法看到自己的待办事项

**可能原因**:
1. Token 未正确传递
2. 后端用户隔离逻辑有问题

**解决方案**:
1. 检查请求头是否包含 Token
2. 检查后端日志中的用户信息
3. 确认数据库中的 `user_id` 字段正确关联

## 数据库结构

### users 表

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### todos 表（已添加 user_id 外键）

```sql
ALTER TABLE todos 
ADD COLUMN user_id BIGINT NOT NULL,
ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

## 配置说明

### 后端配置

**application.properties**:
```properties
# JWT配置
jwt.secret=mySecretKey1234567890123456789012345678901234567890
jwt.expiration=86400000  # 24小时（毫秒）
```

**安全配置**:
- 允许 `/api/auth/**` 无需认证
- 其他所有请求需要认证
- 使用 JWT 认证过滤器

### 前端配置

**vite.config.js**:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

## 最佳实践

1. **Token 存储**: 使用 localStorage（本项目）或 httpOnly Cookie（更安全）
2. **Token 刷新**: 可以实现 Token 刷新机制，延长用户会话
3. **密码策略**: 建议添加密码强度验证
4. **登录限制**: 可以实现登录失败次数限制
5. **HTTPS**: 生产环境必须使用 HTTPS

## 相关文件

### 后端文件
- `User.java` - 用户实体
- `UserRepository.java` - 用户数据访问
- `AuthController.java` - 认证控制器
- `AuthService.java` - 认证服务
- `JwtUtil.java` - JWT 工具类
- `JwtAuthenticationFilter.java` - JWT 认证过滤器
- `SecurityConfig.java` - 安全配置
- `UserDetailsServiceImpl.java` - 用户详情服务
- `SecurityUtil.java` - 安全工具类

### 前端文件
- `authService.js` - 认证服务
- `todoService.js` - 待办事项服务（已集成 Token）
- `LoginForm.jsx` - 登录组件
- `RegisterForm.jsx` - 注册组件
- `ProtectedRoute.jsx` - 路由保护组件
- `UserMenu.jsx` - 用户菜单组件
- `App.jsx` - 主应用（路由配置）

## 更新日志

- **v1.0.0** (2024)
  - ✅ 实现用户注册和登录
  - ✅ JWT Token 认证
  - ✅ 密码 BCrypt 加密
  - ✅ 用户数据隔离
  - ✅ 路由保护
  - ✅ Token 过期处理


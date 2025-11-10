# 全栈待办事项应用

一个现代化、功能丰富的前后端分离全栈项目，使用 React + Vite 作为前端，Java Spring Boot 作为后端。

## 📁 项目结构

```
.
├── backend/                           # Java Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/todo/
│   │   │   │   ├── TodoApplication.java         # 应用入口
│   │   │   │   ├── controller/                  # 控制器层（REST API）
│   │   │   │   │   └── TodoController.java
│   │   │   │   ├── service/                     # 服务层（业务逻辑）
│   │   │   │   │   └── TodoService.java
│   │   │   │   ├── repository/                  # 数据访问层
│   │   │   │   │   └── TodoRepository.java      # JPA Repository 接口
│   │   │   │   ├── model/                       # 数据模型
│   │   │   │   │   └── Todo.java
│   │   │   │   ├── dto/                         # 数据传输对象
│   │   │   │   │   └── TodoRequest.java
│   │   │   │   └── exception/                   # 异常处理
│   │   │   │       ├── TodoNotFoundException.java
│   │   │   │       └── GlobalExceptionHandler.java
│   │   │   └── resources/
│   │   │       └── application.properties       # 配置文件
│   │   └── pom.xml                              # Maven 依赖配置
│   └── (无需本地数据库文件，使用MySQL)
│
├── frontend/                         # React + Vite 前端
│   ├── src/
│   │   ├── components/              # React 组件
│   │   │   ├── TodoList.jsx         # 待办列表组件
│   │   │   ├── TodoItem.jsx         # 待办项组件
│   │   │   ├── TodoForm.jsx         # 表单组件
│   │   │   ├── TodoFilter.jsx      # 筛选组件
│   │   │   └── TodoStats.jsx       # 统计组件
│   │   ├── services/               # API 服务层
│   │   │   └── todoService.js      # 待办事项 API
│   │   ├── utils/                  # 工具函数
│   │   │   ├── constants.js        # 常量定义
│   │   │   └── dateUtils.js        # 日期工具
│   │   ├── styles/                 # 样式文件
│   │   │   ├── index.css           # 全局样式
│   │   │   ├── App.css             # 应用样式
│   │   │   └── components.css     # 组件样式
│   │   ├── App.jsx                 # 主应用组件
│   │   └── main.jsx                # React 入口
│   ├── index.html                   # HTML 模板
│   ├── vite.config.js               # Vite 配置
│   └── package.json                 # 前端依赖
│
└── README.md                         # 项目说明
```

## 🏗️ 架构设计

### 后端架构（三层架构）

```
Controller Layer (控制器层)
    ↓
Service Layer (服务层)
    ↓
Repository Layer (JPA Repository)
    ↓
MySQL Database (关系型数据库)
```

- **Controller**: 处理 HTTP 请求，参数验证，返回响应
- **Service**: 业务逻辑处理，事务管理
- **Repository**: JPA Repository，自动实现 CRUD 操作
- **Database**: MySQL 关系型数据库，支持 SQL 查询

### 前端架构（组件化）

```
App (主容器)
├── TodoStats (统计)
├── TodoForm (表单)
├── TodoFilter (筛选)
└── TodoList
    └── TodoItem (列表项)
```

- **组件化**: 单一职责，易于维护
- **服务层**: API 调用统一封装
- **工具层**: 常量和工具函数复用

## ✨ 功能特性

### 核心功能
- ✅ 添加待办事项（支持优先级设置）
- ✅ 标记完成/未完成
- ✅ 编辑待办事项内容
- ✅ 删除待办事项
- ✅ 实时更新列表

### 增强功能
- 🎯 **优先级管理**：高/中/低三个优先级，不同颜色标识
- 🔍 **筛选功能**：全部/进行中/已完成三种筛选
- 📊 **统计信息**：显示总计、进行中、已完成数量
- 📅 **时间显示**：显示待办事项创建时间
- ✏️ **内联编辑**：点击编辑按钮即可编辑
- 🎨 **现代化UI**：渐变背景、动画效果、响应式设计

## 🚀 快速开始

### 前置要求
- Java 17 或更高版本
- Maven 3.6+
- Node.js 16+ 和 npm
- **MySQL 8.0+** (已安装)

### 🎯 一键启动（推荐）

**最简单的方式 - 一键启动所有服务：**

- **Windows**：
  1. 右键点击 `start-all.bat`
  2. 选择"以管理员身份运行"（如果 MySQL 已启动，也可以直接双击运行）
  3. 脚本会自动：
     - ✅ 检查所有必要的工具（Java、Maven、Node.js、npm）
     - ✅ 检查并启动 MySQL 服务（如果未运行）
     - ✅ 检查/安装前端依赖
     - ✅ 启动后端服务器（新窗口）
     - ✅ 启动前端服务器（新窗口）
     - ✅ **自动打开浏览器访问前端页面**

- **Linux/Mac**：
  ```bash
  # 首先给脚本添加执行权限
  chmod +x start-all.sh
  
  # 然后以管理员权限运行
  sudo ./start-all.sh
  ```

> **提示**：一键启动脚本会自动处理所有准备工作，包括检查工具、启动 MySQL、安装依赖等。

---

### 📝 手动启动（分步操作）

如果您想手动控制每个步骤，可以按照以下方式操作：

### 0. 数据库准备（重要！）

在启动后端之前，必须先设置 MySQL 数据库：

1. **启动 MySQL 服务**
   
   **Windows 方法1：使用管理员权限的命令提示符**
   ```bash
   # 1. 右键点击"命令提示符"或"PowerShell"
   # 2. 选择"以管理员身份运行"
   # 3. 执行以下命令：
   net start MySQL80
   ```
   
   **Windows 方法2：使用服务管理器（推荐）**
   ```bash
   # 1. 按 Win + R，输入 services.msc，回车
   # 2. 找到 "MySQL80" 服务
   # 3. 右键点击，选择"启动"
   ```
   
   **Windows 方法3：使用 PowerShell（管理员权限）**
   ```powershell
   # 以管理员身份运行 PowerShell，然后执行：
   Start-Service MySQL80
   ```
   
   **Linux/Mac**
   ```bash
   sudo systemctl start mysql
   # 或
   sudo service mysql start
   ```
   
   **验证 MySQL 是否运行**
   ```bash
   # Windows PowerShell
   Get-Service MySQL80
   
   # 应该显示 Status: Running
   ```

2. **登录 MySQL 并创建数据库**
   ```bash
   mysql -u root -p
   ```
   然后执行：
   ```sql
   CREATE DATABASE tododb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

3. **检查并修改数据库连接配置**
   
   编辑 `backend/src/main/resources/application.properties`，确认以下配置：
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/tododb?...
   spring.datasource.username=root        # 默认用户名
   spring.datasource.password=Aa123456   # 请修改为您的MySQL密码
   ```
   
   > **提示**：如果您的 MySQL 密码不是 `Aa123456`，请修改 `application.properties` 中的密码

### 1. 启动后端服务器

**方法1：使用启动脚本（推荐，自动启动MySQL）**

- **Windows**：
  1. 右键点击 `start-backend.bat`
  2. 选择"以管理员身份运行"
  3. 脚本会自动启动 MySQL 服务，然后启动后端服务器

- **Linux/Mac**：
  ```bash
  sudo ./start-backend.sh
  ```

**方法2：手动启动**

```bash
cd backend
mvn spring-boot:run
```

> **注意**：使用手动启动时，请确保 MySQL 服务已启动（见步骤0）

后端服务器将在 `http://localhost:3001` 启动

**启动成功的标志**：
- 看到 "Started TodoApplication" 日志
- 没有数据库连接错误
- 可以访问 `http://localhost:3001/api/todos` (应该返回空数组 `[]`)

**常见问题**：
- ❌ `Connection refused` - 检查 MySQL 服务是否启动
- ❌ `Access denied` - 检查用户名和密码是否正确
- ❌ `Unknown database 'tododb'` - 先创建数据库（见步骤0）

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 启动前端开发服务器

```bash
npm run dev
```

**或者使用启动脚本**：
- Windows: `start-frontend.bat` - 会自动打开浏览器
- Linux/Mac: `./start-frontend.sh` - 会自动打开浏览器

前端应用将在 `http://localhost:3000` 启动，浏览器会自动打开该页面

---

## 📋 启动脚本说明

项目提供了多个启动脚本，方便不同场景使用：

| 脚本 | 功能 | 使用方式 | 特殊功能 |
|------|------|---------|---------|
| `start-all.bat` / `start-all.sh` | **一键启动所有服务**（推荐） | Windows: 右键以管理员身份运行<br>Linux/Mac: `sudo ./start-all.sh` | ✅ 自动打开浏览器 |
| `start-backend.bat` / `start-backend.sh` | 仅启动后端（含MySQL） | Windows: 右键以管理员身份运行<br>Linux/Mac: `sudo ./start-backend.sh` | ✅ 自动检测MySQL状态 |
| `start-frontend.bat` / `start-frontend.sh` | 仅启动前端 | 直接双击运行 | ✅ 自动打开浏览器 |

## 📡 API 接口

后端提供以下 RESTful API：

### 获取待办事项
- `GET /api/todos` - 获取所有待办事项
- `GET /api/todos?filter=ALL|ACTIVE|COMPLETED` - 按筛选条件获取
- `GET /api/todos/{id}` - 获取单个待办事项

### 创建待办事项
- `POST /api/todos` - 创建新的待办事项
  ```json
  {
    "text": "待办事项内容",
    "priority": "HIGH|MEDIUM|LOW"
  }
  ```

### 更新待办事项
- `PUT /api/todos/{id}` - 完整更新待办事项
- `PATCH /api/todos/{id}` - 部分更新待办事项
  ```json
  {
    "text": "更新后的内容",
    "completed": true,
    "priority": "HIGH"
  }
  ```

### 删除待办事项
- `DELETE /api/todos/{id}` - 删除待办事项

## 🛠️ 技术栈

### 后端
- **Java 17** (LTS)
- **Spring Boot 3.2.0**
- **Spring Web** - RESTful API
- **Spring Data JPA** - ORM 框架
- **MySQL** - 关系型数据库
- **Spring Validation** - 数据验证
- **Jackson** - JSON 序列化
- **Maven** - 依赖管理

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **现代 CSS** - 渐变、动画、响应式设计

## 📊 数据模型

```java
Todo {
  id: Long                    // 唯一标识
  text: String                // 待办内容
  completed: Boolean          // 完成状态
  priority: String            // 优先级 (LOW, MEDIUM, HIGH)
  createdAt: LocalDateTime    // 创建时间
  updatedAt: LocalDateTime    // 更新时间
}
```

## 💾 数据持久化

- **存储方式**: MySQL 关系型数据库
- **ORM 框架**: Spring Data JPA
- **数据库**: `tododb` (需要预先创建)
- **自动初始化**: 首次启动时自动创建表结构
- **连接配置**: 在 `application.properties` 中配置数据库连接信息
  - 默认连接: `jdbc:mysql://localhost:3306/tododb`
  - 默认用户名: `root`
  - 默认密码: `root` (请根据实际情况修改)

## 🎨 样式特色

- 🎨 动态渐变背景
- ✨ 流畅的动画过渡
- 🎯 优先级颜色标识
- 📱 完全响应式设计
- 💫 悬停效果和交互反馈

## 📝 代码规范

### 命名规范
- **类名**: 大驼峰（PascalCase）
- **方法名**: 小驼峰（camelCase）
- **常量**: 大写下划线（UPPER_SNAKE_CASE）
- **文件名**: 与类名/组件名一致

### 目录结构
- **后端**: 按层次划分（controller/service/repository/model/dto）
- **前端**: 按功能划分（components/services/utils/styles）

## 🔄 改进计划

- [x] 添加数据持久化（JSON文件存储）
- [x] 重构为三层架构（Controller-Service-Repository）
- [x] 前端组件化拆分
- [x] API 服务层封装
- [x] 添加 SQL 数据库持久化（MySQL + JPA）
- [x] 切换到生产级数据库（MySQL）
- [ ] 添加用户认证和授权
- [ ] 添加待办事项分类/标签
- [ ] 添加搜索功能
- [ ] 添加排序功能（按优先级、时间等）
- [ ] 添加单元测试和集成测试
- [ ] 添加 Docker 支持

## 🔧 故障排除

### 后端启动问题

**问题：MySQL 连接失败**
- ✅ 检查 MySQL 服务是否运行：`Get-Service MySQL80` (Windows) 或 `systemctl status mysql` (Linux)
- ✅ 确认数据库已创建：`SHOW DATABASES LIKE 'tododb';`
- ✅ 检查 `application.properties` 中的用户名和密码是否正确
- ✅ 确认 MySQL 端口 3306 未被占用

**问题：端口被占用**
- ✅ 后端端口 3001 被占用：修改 `application.properties` 中的 `server.port`
- ✅ MySQL 端口 3306 被占用：检查是否有其他 MySQL 实例运行

**问题：依赖下载失败**
- ✅ 检查网络连接
- ✅ 配置 Maven 镜像源（如阿里云镜像）
- ✅ 清理 Maven 缓存：`mvn clean`

### 前端启动问题

**问题：npm install 失败**
- ✅ 检查 Node.js 版本（需要 16+）
- ✅ 清理 npm 缓存：`npm cache clean --force`
- ✅ 删除 `node_modules` 和 `package-lock.json` 后重新安装

**问题：端口被占用**
- ✅ 前端端口 3000 被占用：Vite 会自动使用下一个可用端口
- ✅ 查看终端输出确认实际端口号

**问题：无法连接后端**
- ✅ 确认后端服务器已启动
- ✅ 检查后端是否运行在 `http://localhost:3001`
- ✅ 检查浏览器控制台的错误信息
- ✅ 确认 CORS 配置正确

### 数据库问题

**问题：表结构未自动创建**
- ✅ 检查 `spring.jpa.hibernate.ddl-auto=update` 配置
- ✅ 查看后端启动日志中的 SQL 语句
- ✅ 手动创建表结构（参考 `ARCHITECTURE.md` 中的表结构）

**问题：数据丢失**
- ✅ 检查 MySQL 服务是否正常
- ✅ 确认数据库连接配置正确
- ✅ 查看 MySQL 日志文件

## 📚 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 详细的架构设计文档
- [后端 README](./backend/README.md) - 后端项目说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

# 🔐 SSHWeby - Modern Web SSH Client

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/xterm.js-000000?style=for-the-badge&logo=terminal&logoColor=white" alt="xterm.js">
  <img src="https://img.shields.io/badge/Mobile-Optimized-00ff88?style=for-the-badge" alt="Mobile Optimized">
</div>

SSHWeby is a modern, mobile-optimized web-based SSH client built with Node.js, Socket.io, and xterm.js. It provides a secure and intuitive interface for accessing SSH servers directly from your browser.

## ✨ Features

### 🎨 Modern UI/UX
- **Beautiful Login Interface**: Modern gradient design with Arabic support
- **Dark Theme**: Eye-friendly terminal interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📱 Mobile-First Experience
- **Virtual Keyboard**: Smart on-screen keyboard with special keys
- **Touch Optimized**: Haptic feedback and touch-friendly controls
- **Quick Actions**: Fast access to common commands
- **Auto-hide Interface**: Keyboard automatically hides when not needed

### 🔧 Advanced Terminal Features
- **Full xterm.js Integration**: Complete terminal emulation
- **Modifier Keys Support**: CTRL, ALT, ESC combinations
- **Arrow Keys Navigation**: Easy command line navigation
- **Special Characters**: Easy access to |, ~, /, - and more

### 🛡️ Security & Performance
- **Secure Connections**: Full SSH2 protocol support
- **Session Management**: Persistent connections with auto-reconnect
- **Logging Support**: Optional session logging and downloads
- **Multi-user Support**: Individual user sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 14 or higher
- NPM or Yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sshweby.git
   cd sshweby
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and go to `http://localhost:2222`
   - Enter your SSH server credentials
   - Start your secure terminal session!

## 📋 Configuration

Copy `config.json.sample` to `config.json` and customize:

```json
{
  "listen": {
    "ip": "0.0.0.0",
    "port": 2222
  },
  "header": {
    "text": "SSHWeby",
    "background": "#00ff88"
  },
  "terminal": {
    "cursorBlink": true,
    "scrollback": 10000,
    "fontSize": 14
  }
}
```

## 📱 Mobile Usage

### Virtual Keyboard
- **Toggle**: Tap the ⌨️ button to show/hide keyboard
- **Long Press**: Hold ⌨️ button for quick actions menu

### Quick Actions (Long press ⌨️)
- **✕**: Send Ctrl+C (cancel current command)
- **🧹**: Clear screen
- **⛶**: Toggle fullscreen mode
- **ℹ️**: Show connection info

### Touch Gestures
- **Double Tap Terminal**: Toggle fullscreen
- **Swipe**: Scroll through terminal history

## 🛠️ Development

### Build Commands
```bash
npm run build          # Production build
npm run builddev       # Development build
npm run watch          # Development with auto-reload
```

### Project Structure
```
sshweby/
├── client/            # Frontend assets
│   ├── src/          # Source files
│   └── public/       # Built assets
├── server/           # Backend modules
├── config.json       # Configuration
└── index.js          # Main entry point
```

## 🌐 Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/sshweby/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

<div align="center">
  
**🚀 Built for the Modern Web • 📱 Mobile-First Design • 🔒 Secure by Default**

Made with ❤️ for developers who need SSH access anywhere, anytime.

**[⭐ Star this repo](https://github.com/yourusername/sshweby)** if you find it useful!

</div>

## 🔗 GitHub SDK Integration

This project is ready for immediate use with GitHub's development ecosystem:

- **GitHub Actions**: CI/CD workflows included
- **GitHub Pages**: Deploy directly to GitHub Pages
- **GitHub CLI**: Use `gh repo clone yourusername/sshweby` for quick setup
- **GitHub Codespaces**: One-click development environment
- **GitHub SDK**: Full compatibility with GitHub's REST and GraphQL APIs

### Quick Deploy with GitHub Pages

1. Fork this repository
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/docs` folder
5. Your SSH client will be live at `https://yourusername.github.io/sshweby`

### GitHub CLI Quick Start

```bash
# Clone and setup in one command
gh repo clone yourusername/sshweby && cd sshweby && npm install && npm run build && npm start
```
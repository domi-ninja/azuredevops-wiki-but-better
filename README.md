# vibe coding is WIP, do not use this yet :) 

# DevOps Wiki Better

A modern, enhanced clone of Azure DevOps Wiki with improved editing capabilities and user experience.

## Features

- 🚀 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- 📝 **WYSIWYG Editing**: Monaco Editor with live markdown preview
- 🌳 **Tree Navigation**: Collapsible folder structure with custom ordering support via `.order` files
- 📁 **File Management**: Upload images and attachments with automatic linking
- ⚡ **Real-time Preview**: Side-by-side editing and preview mode
- 🔧 **Git Integration**: Changes are saved as files, ready to commit and push to Azure DevOps
- 🎨 **GitHub Flavored Markdown**: Full GFM support including tables, task lists, and more

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor (VS Code editor)
- **Markdown**: react-markdown with remark-gfm

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your wiki path**:
   - Copy your Azure DevOps wiki repository to a local directory
   - Update `config.json` or use the settings page to set the path

3. **Start development servers**:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 3001) and frontend (port 3000) concurrently.

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## Configuration

The application uses a `config.json` file in the root directory:

```json
{
  "wikiPath": "../Aurora.wiki",
  "port": 3001,
  "allowedExtensions": [".md", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".pdf"],
  "maxFileSize": 10485760
}
```

- `wikiPath`: Path to your wiki directory (relative or absolute)
- `port`: Backend server port
- `allowedExtensions`: File types allowed for upload
- `maxFileSize`: Maximum file size in bytes (default: 10MB)

## Project Structure

```
devops-wiki-better/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration management
│   │   ├── routes/           # API routes (wiki, files, config)
│   │   ├── types/            # TypeScript type definitions
│   │   └── server.ts         # Express server entry point
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service functions
│   │   └── types/            # TypeScript type definitions
│   ├── vite.config.ts
│   └── tsconfig.json
├── config.json              # Application configuration
└── package.json              # Dependencies and scripts
```

## Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend development server
- `npm run build` - Build both frontend and backend for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint on frontend code

## Wiki Structure

The application expects your wiki to follow this structure:

```
wiki-directory/
├── Page1.md
├── Page2.md
├── Folder1/
│   ├── .order              # Optional: custom ordering
│   ├── SubPage1.md
│   └── SubPage2.md
└── .attachments/           # Auto-created for uploaded files
    ├── image1.png
    └── document.pdf
```

### Custom Ordering

Create a `.order` file in any directory to customize the display order:

```
Page1.md
Folder1
Page2.md
```

Files and folders not listed in `.order` will appear after the ordered items.

## Development

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes/`
2. **Frontend**: Add new pages in `frontend/src/pages/` and components in `frontend/src/components/`
3. **API**: Update service functions in `frontend/src/services/api.ts`
4. **Types**: Add TypeScript definitions in respective `types/` directories

### Building for Production

```bash
npm run build
npm run start
```

The built application will serve the React app from the Express server.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Wiki Path Not Found
- Check that the `wikiPath` in `config.json` is correct
- Ensure the directory exists and is accessible
- Use the Settings page to update the configuration

### Files Not Loading
- Verify the wiki directory contains `.md` files
- Check file permissions
- Look at browser console for error messages

### Upload Issues
- Check `allowedExtensions` and `maxFileSize` in config
- Ensure the `.attachments` directory is writable
- Verify file types are supported

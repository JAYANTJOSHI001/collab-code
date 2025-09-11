import { monaco } from './monaco-loader';

const monacoConfig = () => {
  // Define custom theme
  monaco.editor.defineTheme('custom-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: '569CD6' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' }
    ],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#2F2F2F',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41'
    }
  });

  // Set default editor options
  monaco.editor.setTheme('custom-dark');

  // Configure language features
  const languages = ['javascript', 'typescript', 'html', 'css', 'json'];
  languages.forEach(lang => {
    monaco.languages.registerDocumentFormattingEditProvider(lang, {
      provideDocumentFormattingEdits: (model) => [{
        range: model.getFullModelRange(),
        text: model.getValue()
      }]
    });
  });
};

export default monacoConfig;
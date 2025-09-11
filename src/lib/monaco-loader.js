import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

// Configure monaco loader
loader.config({ monaco });

// Export monaco for use in other modules
export { monaco };
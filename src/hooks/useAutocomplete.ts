import { useRef, useCallback } from 'react';
import * as monaco from 'monaco-editor';

interface AutocompleteOptions {
  enabled: boolean;
  debounceMs?: number;
  minCharacters?: number;
}

export function useAutocomplete(
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>,
  options: AutocompleteOptions = { enabled: true, debounceMs: 500, minCharacters: 3 }
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const suggestionWidgetRef = useRef<monaco.editor.IContentWidget | null>(null);

  // Fetch AI suggestions from your backend
  const fetchSuggestion = async (
    code: string,
    cursorPosition: monaco.Position,
    language: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autoComplete/autocomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          line: cursorPosition.lineNumber,
          column: cursorPosition.column,
          language,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.suggestion || null;
    } catch (error) {
      console.error('Autocomplete error:', error);
      return null;
    }
  };

  // Show inline suggestion widget
  const showSuggestion = useCallback((
    editor: monaco.editor.IStandaloneCodeEditor,
    suggestion: string,
    position: monaco.Position
  ) => {
    // Remove existing widget
    if (suggestionWidgetRef.current) {
      editor.removeContentWidget(suggestionWidgetRef.current);
    }

    // Create ghost text widget
    const widget: monaco.editor.IContentWidget = {
      getId: () => 'ai-autocomplete-widget',
      getDomNode: () => {
        const node = document.createElement('div');
        node.style.opacity = '0.4';
        node.style.fontStyle = 'italic';
        node.style.color = '#858585';
        node.textContent = suggestion;
        return node;
      },
      getPosition: () => ({
        position,
        preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
      })
    };

    editor.addContentWidget(widget);
    suggestionWidgetRef.current = widget;
  }, []);

  // Hide suggestion widget
  const hideSuggestion = useCallback(() => {
    if (editorRef.current && suggestionWidgetRef.current) {
      editorRef.current.removeContentWidget(suggestionWidgetRef.current);
      suggestionWidgetRef.current = null;
    }
  }, [editorRef]);

  // Handle autocomplete trigger
  const triggerAutocomplete = useCallback(async () => {
    if (!options.enabled || !editorRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    // Check minimum characters
    if (textUntilPosition.trim().length < (options.minCharacters || 3)) {
      hideSuggestion();
      return;
    }

    // Fetch and show suggestion
    const language = model.getLanguageId();
    const suggestion = await fetchSuggestion(
      model.getValue(),
      position,
      language
    );

    if (suggestion) {
      showSuggestion(editor, suggestion, position);
    } else {
      hideSuggestion();
    }
  }, [options, editorRef, showSuggestion, hideSuggestion]);

  // Debounced autocomplete
  const debouncedAutocomplete = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerAutocomplete();
    }, options.debounceMs || 500);
  }, [triggerAutocomplete, options.debounceMs]);

  // Accept suggestion (Tab key)
  const acceptSuggestion = useCallback(() => {
    if (!editorRef.current || !suggestionWidgetRef.current) return false;

    const editor = editorRef.current;
    const position = editor.getPosition();
    if (!position) return false;

    const domNode = suggestionWidgetRef.current.getDomNode();
    const suggestion = domNode.textContent || '';

    // Insert suggestion
    editor.executeEdits('ai-autocomplete', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: suggestion,
    }]);

    hideSuggestion();
    return true;
  }, [editorRef, hideSuggestion]);

  return {
    triggerAutocomplete: debouncedAutocomplete,
    acceptSuggestion,
    hideSuggestion,
  };
}
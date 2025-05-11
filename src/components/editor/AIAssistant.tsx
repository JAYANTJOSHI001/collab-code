import React, { useState , useCallback, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  code: string;
  language: string;
  cursorPosition?: {
    lineNumber: number;
    column: number;
  };
  onSuggestionSelect?: (suggestion: string) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  code,
  language,
  cursorPosition,
  onSuggestionSelect
}) => {
  const [activeTab, setActiveTab] = useState('suggest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ text: string; description: string }>>([]);
  const [response, setResponse] = useState<string>('');
  const [errorText, setErrorText] = useState('');
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [loadingStates, setLoadingStates] = useState({
    suggest: false,
    debug: false,
    optimize: false,
    explain: false,
    gemini: false
  });

  console.log(setLoading);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetSuggestions = useCallback(
    debounce(() => {
      if (!code || !language || !cursorPosition) return;
      handleGetSuggestions();
    }, 500), // 500ms debounce
    [code, language, cursorPosition]
  );

  const handleGetSuggestions = async () => {
    if (!code || !language) return;
    
    setLoadingStates(prev => ({ ...prev, suggest: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/suggest`, {
        code,
        language,
        cursorPosition
      });
      
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions([]);
        setError('Invalid response format from AI service');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setError('Failed to get suggestions');
      setSuggestions([]);
    } finally {
      setLoadingStates(prev => ({ ...prev, suggest: false }));
    }
  };

  const handleDebug = async () => {
    if (!code || !language) return;
    
    setLoadingStates(prev => ({ ...prev, debug: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/debug`, {
        code,
        language,
        error: errorText
      });
      
      setResponse(data.explanation || 'No issues found');
    } catch (error) {
      console.error('Error debugging code:', error);
      setError('Failed to debug code');
    } finally {
      setLoadingStates(prev => ({ ...prev, debug: false }));
    }
  };

  const handleOptimize = async () => {
    if (!code || !language) return;
    
    setLoadingStates(prev => ({ ...prev, optimize: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/optimize`, {
        code,
        language
      });
      
      setResponse(data.explanation || 'No optimization suggestions');
    } catch (error) {
      console.error('Error optimizing code:', error);
      setError('Failed to optimize code');
    } finally {
      setLoadingStates(prev => ({ ...prev, optimize: false }));
    }
  };

 const handleExplain = async () => {
    if (!code || !language) return;
    
    setLoadingStates(prev => ({ ...prev, explain: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/explain`, {
        code,
        language
      });
      
      setResponse(data.explanation || 'No explanation available');
    } catch (error) {
      console.error('Error explaining code:', error);
      setError('Failed to explain code');
    } finally {
      setLoadingStates(prev => ({ ...prev, explain: false }));
    }
  };

  useEffect(() => {
    debouncedGetSuggestions();
    return () => {
      debouncedGetSuggestions.cancel();
    };
  }, [code, language, cursorPosition, debouncedGetSuggestions]);

  const handleGeminiRequest = async () => {
    if (!geminiPrompt || !language) return;
    
    setLoadingStates(prev => ({ ...prev, gemini: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/gemini`, {
        prompt: geminiPrompt,
        language,
        context: code
      });
      
      setResponse(data.suggestion || 'No response from Gemini');
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      setError('Failed to get response from Gemini');
    } finally {
      setLoadingStates(prev => ({ ...prev, gemini: false }));
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResponse('');
    setSuggestions([]);
    setError(null);
    
    if (value === 'suggest') {
      handleGetSuggestions();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>
          Get code suggestions, debugging help, optimizations, and explanations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="suggest">Suggest</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
            <TabsTrigger value="explain">Explain</TabsTrigger>
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggest">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Suggestions:</h3>
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSuggestionSelect?.(suggestion.text)}
                  >
                    <div className="font-mono text-sm">{suggestion.text}</div>
                    <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Click &quot;Suggest&quot; to get code suggestions
              </div>
            )}
            <Button 
              className="mt-4 w-full" 
              onClick={handleGetSuggestions}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting suggestions...
                </>
              ) : 'Get Suggestions'}
            </Button>
          </TabsContent>
          
          <TabsContent value="debug">
            <Textarea
              placeholder="Enter error message (optional)"
              className="mb-4"
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
            />
            <Button 
              className="mb-4 w-full" 
              onClick={handleDebug}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debugging...
                </>
              ) : 'Debug Code'}
            </Button>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {response && (
              <div className="border rounded-md p-4 bg-gray-50">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="optimize">
            <Button 
              className="mb-4 w-full" 
              onClick={handleOptimize}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : 'Optimize Code'}
            </Button>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {response && (
              <div className="border rounded-md p-4 bg-gray-50">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="explain">
            <Button 
              className="mb-4 w-full" 
              onClick={handleExplain}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Explaining...
                </>
              ) : 'Explain Code'}
            </Button>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {response && (
              <div className="border rounded-md p-4 bg-gray-50">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="gemini">
            <Textarea
              placeholder="Ask Gemini anything about your code..."
              className="mb-4"
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
              rows={4}
            />
            <Button 
              className="mb-4 w-full" 
              onClick={handleGeminiRequest}
              disabled={loadingStates.gemini}
            >
              {loadingStates.gemini ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : 'Ask Gemini'}
            </Button>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {response && (
              <div className="border rounded-md p-4 bg-gray-50">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
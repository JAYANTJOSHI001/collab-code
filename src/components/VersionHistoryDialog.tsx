
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';

interface Version {
  id: string;
  timestamp: Date;
  content: string;
}

interface VersionHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  versions: Version[];
  onRestore: (version: Version) => void;
  currentFileName: string;
}

const VersionHistoryDialog = ({ 
  isOpen, 
  onClose, 
  versions, 
  onRestore,
  currentFileName
}: VersionHistoryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Version History - {currentFileName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[50vh] mt-4">
          {versions.length > 0 ? (
            <div className="space-y-4">
              {versions.map((version) => (
                <div key={version.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(version.timestamp), { addSuffix: true })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onRestore(version)}
                    >
                      Restore
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs font-mono overflow-x-auto">
                    <pre>{version.content.slice(0, 200)}{version.content.length > 200 ? '...' : ''}</pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No version history available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryDialog;

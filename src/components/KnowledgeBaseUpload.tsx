import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, File, X, Brain, Loader2 } from "lucide-react";

interface KnowledgeBaseUploadProps {
  agentId: string;
  onKnowledgeAdded?: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export const KnowledgeBaseUpload = ({ agentId, onKnowledgeAdded }: KnowledgeBaseUploadProps) => {
  const { user } = useAuth();
  const [knowledgeBaseName, setKnowledgeBaseName] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const acceptedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown'
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const createKnowledgeBase = async () => {
    if (!user || !knowledgeBaseName.trim() || files.length === 0) {
      toast.error("Please provide a name and upload at least one file");
      return;
    }

    setIsCreating(true);

    try {
      // Create knowledge base
      const { data: knowledgeBase, error: kbError } = await supabase
        .from('knowledge_bases')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          name: knowledgeBaseName.trim(),
          description: `Knowledge base with ${files.length} file(s)`
        })
        .select()
        .single();

      if (kbError) throw kbError;

      // Upload files
      for (const uploadFile of files) {
        try {
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'uploading' as const }
              : f
          ));

          // Upload to storage
          const fileName = `${user.id}/${knowledgeBase.id}/${uploadFile.file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('knowledge-files')
            .upload(fileName, uploadFile.file);

          if (uploadError) throw uploadError;

          // Save file record
          const { error: fileError } = await supabase
            .from('knowledge_files')
            .insert({
              knowledge_base_id: knowledgeBase.id,
              user_id: user.id,
              file_name: uploadFile.file.name,
              file_path: fileName,
              file_size: uploadFile.file.size,
              mime_type: uploadFile.file.type,
              processing_status: 'pending'
            });

          if (fileError) throw fileError;

          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'processing' as const, progress: 100 }
              : f
          ));

          // TODO: Add document processing here
          // For now, mark as completed
          setTimeout(() => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'completed' as const }
                : f
            ));
          }, 1000);

        } catch (error: any) {
          console.error('Error uploading file:', error);
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error' as const, error: error.message }
              : f
          ));
        }
      }

      toast.success("Knowledge base created successfully!");
      setKnowledgeBaseName("");
      setFiles([]);
      onKnowledgeAdded?.();

    } catch (error: any) {
      console.error('Error creating knowledge base:', error);
      toast.error("Failed to create knowledge base");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Add Knowledge Base
        </CardTitle>
        <CardDescription>
          Upload documents to train your agent with your professional expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="knowledgeBaseName">Knowledge Base Name</Label>
          <Input
            id="knowledgeBaseName"
            placeholder="e.g., Design Portfolio, Writing Samples, Code Examples"
            value={knowledgeBaseName}
            onChange={(e) => setKnowledgeBaseName(e.target.value)}
          />
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <Input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Choose Files
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Supports PDF, TXT, DOC, DOCX, MD (max 10MB each)
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Files to Upload</h4>
            {files.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <File className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="mt-1 h-1" />
                  )}
                  {uploadFile.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">{uploadFile.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'pending' && (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  )}
                  {uploadFile.status === 'processing' && (
                    <span className="text-xs text-yellow-600">Processing</span>
                  )}
                  {uploadFile.status === 'completed' && (
                    <span className="text-xs text-green-600">✓ Complete</span>
                  )}
                  {uploadFile.status === 'error' && (
                    <span className="text-xs text-destructive">Error</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={isCreating}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={createKnowledgeBase}
          disabled={!knowledgeBaseName.trim() || files.length === 0 || isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Knowledge Base...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
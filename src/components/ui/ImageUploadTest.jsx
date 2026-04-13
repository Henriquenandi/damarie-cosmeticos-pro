import React, { useState } from 'react';
import { supabaseHelpers } from '@/api/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2 } from 'lucide-react';

export default function ImageUploadTest() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `test-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Upload file
      const uploadResult = await supabaseHelpers.uploadFile('damarie-files', filePath, file);
      console.log('Upload result:', uploadResult);
      
      // Get public URL
      const publicUrl = supabaseHelpers.getFileUrl('damarie-files', filePath);
      console.log('Public URL:', publicUrl);
      
      setImageUrl(publicUrl);
      toast.success('Upload realizado com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-semibold">Teste de Upload de Imagem</h3>
      
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Fazendo upload...</span>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">Upload concluído!</p>
          <p className="text-xs text-slate-500 break-all">URL: {imageUrl}</p>
          <img src={imageUrl} alt="Uploaded" className="w-32 h-32 object-cover rounded border" />
        </div>
      )}
    </div>
  );
}
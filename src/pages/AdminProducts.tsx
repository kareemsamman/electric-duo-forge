import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Check authentication
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/');
        return null;
      }
      return data.session;
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      let imageUrl = formData.get('product_image') as string;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        product_name: formData.get('product_name') as string,
        product_name_en: formData.get('product_name_en') as string || null,
        price: Number(formData.get('price')),
        sku: formData.get('sku') as string || null,
        category: formData.get('category') as string,
        short_description_he: formData.get('short_description_he') as string || null,
        short_description_en: formData.get('short_description_en') as string || null,
        product_description: formData.get('product_description') as string,
        product_description_en: formData.get('product_description_en') as string || null,
        product_specs: formData.get('product_specs') as string || '',
        product_specs_en: formData.get('product_specs_en') as string || null,
        product_image: imageUrl,
        thumbnail: imageUrl,
        in_stock: formData.get('in_stock') === 'true',
        stock_qty: Number(formData.get('stock_qty')) || 0,
        is_featured: formData.get('is_featured') === 'true',
        slug: `product-${Date.now()}`
      };

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('מוצר נוצר בהצלחה');
      setIsDialogOpen(false);
      setImageFile(null);
    },
    onError: (error) => {
      toast.error('שגיאה ביצירת המוצר');
      console.error(error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      let imageUrl = formData.get('product_image') as string;
      
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        product_name: formData.get('product_name') as string,
        product_name_en: formData.get('product_name_en') as string || null,
        price: Number(formData.get('price')),
        sku: formData.get('sku') as string || null,
        category: formData.get('category') as string,
        short_description_he: formData.get('short_description_he') as string || null,
        short_description_en: formData.get('short_description_en') as string || null,
        product_description: formData.get('product_description') as string,
        product_description_en: formData.get('product_description_en') as string || null,
        product_specs: formData.get('product_specs') as string || null,
        product_specs_en: formData.get('product_specs_en') as string || null,
        product_image: imageUrl,
        thumbnail: imageUrl,
        in_stock: formData.get('in_stock') === 'true',
        stock_qty: Number(formData.get('stock_qty')) || 0,
        is_featured: formData.get('is_featured') === 'true'
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('מוצר עודכן בהצלחה');
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
    },
    onError: (error) => {
      toast.error('שגיאה בעדכון המוצר');
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('מוצר נמחק בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת המוצר');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen py-20 pt-28">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          {language === 'he' ? (
            <>
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה ללוח הבקרה
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </>
          )}
        </Button>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-3xl">ניהול מוצרים</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף מוצר חדש
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'ערוך מוצר' : 'הוסף מוצר חדש'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_name">שם מוצר (עברית)*</Label>
                      <Input
                        id="product_name"
                        name="product_name"
                        defaultValue={editingProduct?.product_name}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_name_en">שם מוצר (English)</Label>
                      <Input
                        id="product_name_en"
                        name="product_name_en"
                        defaultValue={editingProduct?.product_name_en}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">מחיר*</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingProduct?.price}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="sku">מק"ט</Label>
                      <Input
                        id="sku"
                        name="sku"
                        defaultValue={editingProduct?.sku}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">קטגוריה*</Label>
                      <Input
                        id="category"
                        name="category"
                        defaultValue={editingProduct?.category}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="short_description_he">תיאור קצר (עברית)</Label>
                      <Textarea
                        id="short_description_he"
                        name="short_description_he"
                        defaultValue={editingProduct?.short_description_he}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="short_description_en">תיאור קצר (English)</Label>
                      <Textarea
                        id="short_description_en"
                        name="short_description_en"
                        defaultValue={editingProduct?.short_description_en}
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_description">תיאור מלא (עברית)*</Label>
                      <Textarea
                        id="product_description"
                        name="product_description"
                        defaultValue={editingProduct?.product_description}
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_description_en">תיאור מלא (English)</Label>
                      <Textarea
                        id="product_description_en"
                        name="product_description_en"
                        defaultValue={editingProduct?.product_description_en}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product_specs">מפרט טכני (עברית)*</Label>
                      <Textarea
                        id="product_specs"
                        name="product_specs"
                        defaultValue={editingProduct?.product_specs}
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="product_specs_en">מפרט טכני (English)</Label>
                      <Textarea
                        id="product_specs_en"
                        name="product_specs_en"
                        defaultValue={editingProduct?.product_specs_en}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">תמונת מוצר</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                      {editingProduct?.product_image && !imageFile && (
                        <img
                          src={editingProduct.product_image}
                          alt="Current"
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </div>
                    <input
                      type="hidden"
                      name="product_image"
                      value={editingProduct?.product_image || ''}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="in_stock"
                        name="in_stock"
                        value="true"
                        defaultChecked={editingProduct?.in_stock ?? true}
                      />
                      <Label htmlFor="in_stock">במלאי</Label>
                    </div>
                    <div>
                      <Label htmlFor="stock_qty">כמות במלאי</Label>
                      <Input
                        id="stock_qty"
                        name="stock_qty"
                        type="number"
                        defaultValue={editingProduct?.stock_qty || 0}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        value="true"
                        defaultChecked={editingProduct?.is_featured}
                      />
                      <Label htmlFor="is_featured">מוצר מומלץ</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingProduct ? 'עדכן' : 'צור מוצר'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>טוען...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>תמונה</TableHead>
                    <TableHead>שם</TableHead>
                    <TableHead>מחיר</TableHead>
                    <TableHead>מק"ט</TableHead>
                    <TableHead>קטגוריה</TableHead>
                    <TableHead>במלאי</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>₪{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {product.in_stock ? (
                          <span className="text-green-600">כן</span>
                        ) : (
                          <span className="text-red-600">לא</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

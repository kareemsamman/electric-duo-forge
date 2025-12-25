import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft, Copy, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      let imageUrl = formData.get('product_image') as string;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const finalImageUrl = mainImageUrl || imageUrl;
      
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
        product_image: finalImageUrl,
        thumbnail: finalImageUrl,
        images: galleryUrls.length > 0 ? galleryUrls : [finalImageUrl],
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
      setGalleryUrls([]);
      setMainImageUrl('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      let imageUrl = formData.get('product_image') as string;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const finalImageUrl = mainImageUrl || imageUrl;

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
        product_image: finalImageUrl,
        thumbnail: finalImageUrl,
        images: galleryUrls.length > 0 ? galleryUrls : [finalImageUrl],
        in_stock: formData.get('in_stock') === 'true',
        stock_qty: Number(formData.get('stock_qty')) || 0,
        is_featured: formData.get('is_featured') === 'true'
      };

      const { error } = await supabase.from('products').update(productData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('מוצר עודכן בהצלחה');
      setIsDialogOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setGalleryUrls([]);
      setMainImageUrl('');
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
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (product: any) => {
      const duplicatedProduct = {
        product_name: `${product.product_name} (עותק)`,
        product_name_en: product.product_name_en ? `${product.product_name_en} (Copy)` : null,
        price: product.price,
        sku: product.sku ? `${product.sku}-copy` : null,
        category: product.category,
        short_description_he: product.short_description_he || null,
        short_description_en: product.short_description_en || null,
        product_description: product.product_description,
        product_description_en: product.product_description_en || null,
        product_specs: product.product_specs || '',
        product_specs_en: product.product_specs_en || null,
        product_image: product.product_image,
        thumbnail: product.thumbnail || product.product_image,
        images: product.images || [],
        in_stock: product.in_stock ?? true,
        stock_qty: product.stock_qty || 0,
        is_featured: false,
        slug: `product-${Date.now()}`,
        display_order: (products?.length || 0) + 1,
      };

      const { error } = await supabase.from('products').insert(duplicatedProduct);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('מוצר שוכפל בהצלחה');
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

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !products) return;
    const items = Array.from(products);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updates = items.map((item, index) => ({ id: item.id, display_order: index }));
    queryClient.setQueryData(['admin-products'], items.map((item, index) => ({ ...item, display_order: index })));

    for (const update of updates) {
      await supabase.from('products').update({ display_order: update.display_order }).eq('id', update.id);
    }
    toast.success('סדר המוצרים עודכן');
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          {language === 'he' ? (
            <><ArrowRight className="ml-2 h-4 w-4" />חזרה ללוח הבקרה</>
          ) : (
            <><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</>
          )}
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ניהול מוצרים</h1>
            <p className="text-muted-foreground">גרור לסידור מחדש, לחץ לעריכה</p>
          </div>
          <Button onClick={() => { 
            setEditingProduct(null); 
            setImageFile(null); 
            setGalleryUrls([]); 
            setMainImageUrl(''); 
            setIsDialogOpen(true); 
          }}>
            <Plus className="w-4 h-4 ml-2" />הוסף מוצר חדש
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {products?.map((product, index) => (
                  <Draggable key={product.id} draggableId={product.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-6 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary' : 'hover:shadow-lg'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <img src={product.product_image} alt={product.product_name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{product.product_name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{product.product_description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="font-bold text-primary">₪{Number(product.price).toFixed(2)}</span>
                              <span className="text-muted-foreground">{product.sku}</span>
                              <span className={product.in_stock ? 'text-emerald-600' : 'text-destructive'}>
                                {product.in_stock ? '✓ במלאי' : '✗ אזל מלאי'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate(product)} title="שכפל">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { 
                              setEditingProduct(product); 
                              setImageFile(null); 
                              setGalleryUrls(product.images || []); 
                              setMainImageUrl(product.product_image || '');
                              setIsDialogOpen(true); 
                            }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => { if (confirm('למחוק מוצר זה?')) deleteMutation.mutate(product.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isLoading && <div className="text-center py-12">טוען...</div>}
        {!isLoading && products?.length === 0 && <div className="text-center py-12 text-muted-foreground">אין מוצרים. הוסף את המוצר הראשון!</div>}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'ערוך מוצר' : 'הוסף מוצר חדש'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>שם מוצר (עברית)*</Label>
                  <Input name="product_name" defaultValue={editingProduct?.product_name} required />
                </div>
                <div>
                  <Label>שם מוצר (English)</Label>
                  <Input name="product_name_en" defaultValue={editingProduct?.product_name_en} />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>מחיר*</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                </div>
                <div>
                  <Label>מק"ט</Label>
                  <Input name="sku" defaultValue={editingProduct?.sku} />
                </div>
                <div>
                  <Label>קטגוריה*</Label>
                  <Input name="category" defaultValue={editingProduct?.category} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תיאור קצר (עברית)</Label>
                  <Textarea name="short_description_he" defaultValue={editingProduct?.short_description_he} rows={2} />
                </div>
                <div>
                  <Label>תיאור קצר (English)</Label>
                  <Textarea name="short_description_en" defaultValue={editingProduct?.short_description_en} rows={2} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תיאור מלא (עברית)*</Label>
                  <Textarea name="product_description" defaultValue={editingProduct?.product_description} rows={4} required />
                </div>
                <div>
                  <Label>תיאור מלא (English)</Label>
                  <Textarea name="product_description_en" defaultValue={editingProduct?.product_description_en} rows={4} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מפרט טכני (עברית)*</Label>
                  <Textarea name="product_specs" defaultValue={editingProduct?.product_specs} rows={3} required />
                </div>
                <div>
                  <Label>מפרט טכני (English)</Label>
                  <Textarea name="product_specs_en" defaultValue={editingProduct?.product_specs_en} rows={3} />
                </div>
              </div>

              {/* Main Image URL */}
              <div>
                <Label>תמונה ראשית (URL)</Label>
                <Input 
                  value={mainImageUrl} 
                  onChange={(e) => setMainImageUrl(e.target.value)} 
                  placeholder="https://example.com/image.jpg"
                />
                {mainImageUrl && (
                  <img src={mainImageUrl} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />
                )}
                <input type="hidden" name="product_image" value={mainImageUrl || editingProduct?.product_image || ''} />
              </div>

              {/* Gallery URLs */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  גלריית תמונות (URLs)
                </Label>
                
                <div className="flex gap-2">
                  <Input
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="הוסף URL לתמונה"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newGalleryUrl.trim()) {
                          setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
                          setNewGalleryUrl('');
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (newGalleryUrl.trim()) {
                        setGalleryUrls([...galleryUrls, newGalleryUrl.trim()]);
                        setNewGalleryUrl('');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {galleryUrls.length > 0 && (
                  <DragDropContext onDragEnd={(result: DropResult) => {
                    if (!result.destination) return;
                    const items = Array.from(galleryUrls);
                    const [reorderedItem] = items.splice(result.source.index, 1);
                    items.splice(result.destination.index, 0, reorderedItem);
                    setGalleryUrls(items);
                  }}>
                    <Droppable droppableId="gallery-images" direction="horizontal">
                      {(provided) => (
                        <div 
                          {...provided.droppableProps} 
                          ref={provided.innerRef}
                          className="flex gap-2 flex-wrap"
                        >
                          {galleryUrls.map((url, index) => (
                            <Draggable key={`${url}-${index}`} draggableId={`${url}-${index}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative group ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                                >
                                  <img
                                    src={url}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-20 h-20 object-cover rounded border cursor-grab"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
                
                <p className="text-xs text-muted-foreground">גרור לסידור מחדש. התמונה הראשונה תהיה התמונה הראשית אם לא הוגדרה תמונה ראשית.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="in_stock" name="in_stock" value="true" defaultChecked={editingProduct?.in_stock ?? true} />
                  <Label htmlFor="in_stock">במלאי</Label>
                </div>
                <div>
                  <Label>כמות במלאי</Label>
                  <Input name="stock_qty" type="number" defaultValue={editingProduct?.stock_qty || 0} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_featured" name="is_featured" value="true" defaultChecked={editingProduct?.is_featured} />
                  <Label htmlFor="is_featured">מוצר מומלץ</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProduct ? 'עדכן מוצר' : 'צור מוצר'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

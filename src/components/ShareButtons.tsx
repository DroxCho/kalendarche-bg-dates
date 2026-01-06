import { Button } from '@/components/ui/button';
import { Holiday } from '@/data/bulgarianHolidays';
import { 
  getShareableUrl, 
  formatShareText, 
  shareToFacebook, 
  shareToTwitter, 
  shareToViber, 
  shareToWhatsApp, 
  copyToClipboard,
  shareNative 
} from '@/lib/sharing';
import { Facebook, Twitter, Copy, Share2, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  date: Date;
  holidays: Holiday[];
}

export function ShareButtons({ date, holidays }: ShareButtonsProps) {
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const url = getShareableUrl(dateString);
  const text = formatShareText(date, holidays);

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      toast.success('Линкът е копиран');
    } else {
      toast.error('Грешка при копиране');
    }
  };

  const handleNativeShare = async () => {
    const success = await shareNative(url, 'Български календар', text);
    if (!success) {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
      <span className="text-sm text-muted-foreground mr-1">Сподели:</span>
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => shareToFacebook(url)}
        title="Сподели във Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => shareToTwitter(url, text)}
        title="Сподели в Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => shareToWhatsApp(url, text)}
        title="Сподели в WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => shareToViber(url, text)}
        title="Сподели във Viber"
      >
        <Phone className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleCopy}
        title="Копирай линк"
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      {'share' in navigator && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleNativeShare}
          title="Други опции"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

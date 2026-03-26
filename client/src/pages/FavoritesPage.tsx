import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, Star, StarOff, Newspaper } from "lucide-react";
import { toast } from "sonner";

export default function FavoritesPage() {
  const utils = trpc.useUtils();

  const { data: favorites, isLoading } = trpc.favorite.list.useQuery();

  const removeFavorite = trpc.favorite.remove.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      utils.favorite.list.invalidate();
      utils.favorite.ids.invalidate();
    },
    onError: (err) => toast.error(`取消收藏失败: ${err.message}`),
  });

  const handleRemove = (articleId: number) => {
    removeFavorite.mutate({ articleId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            我的收藏
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {favorites?.length ?? 0} 条收藏新闻
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">暂无收藏新闻</p>
            <p className="text-sm text-muted-foreground mt-1">
              在新闻列表中点击星标按钮收藏重要新闻
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {favorites.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[15px] leading-relaxed">
                      {article.title}
                    </h3>
                    {article.titleCn && article.titleCn !== article.title && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {article.titleCn}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {article.sourceName && (
                        <Badge variant="outline" className="text-xs">
                          {article.sourceName}
                        </Badge>
                      )}
                      {article.publishDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.publishDate).toLocaleDateString("zh-CN")}
                        </span>
                      )}
                      {(article.matchedKeywords as string[] | null)?.map((kw) => (
                        <Badge key={kw} className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                          {kw}
                        </Badge>
                      ))}
                      {article.favoritedAt && (
                        <span className="text-xs text-yellow-600">
                          收藏于 {new Date(article.favoritedAt).toLocaleDateString("zh-CN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRemove(article.id)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      title="取消收藏"
                    >
                      <StarOff className="h-4 w-4 text-yellow-500" />
                    </button>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import useInfiniteScroll from "./hooks/useInfiniteScroll";
import styles from "./App.module.css";

type Post = {
  id: string;
  createdAt: string;
  publishedAt: string;
  revisedAt: string;
  updatedAt: string;
  content: string;
}

const LIMIT = 10; // 1回あたりの取得件数

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (currentOffset: number) => {
    const domain = import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN;
    const endpoint = import.meta.env.VITE_MICROCMS_ENDPOINT;
    const apiKey = import.meta.env.VITE_MICROCMS_API_KEY;

    try {
      const res = await fetch(
        `https://${domain}.microcms.io/api/v1/${endpoint}?limit=${LIMIT}&offset=${currentOffset}`,
        {
          headers: {
            "X-MICROCMS-API-KEY": apiKey,
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        return data.contents;
      } else {
        console.error("データの取得に失敗しました");
        return [];
      }
    } catch (error) {
      console.error("ネットワークエラー:", error);
      return [];
    }
  };

  const fetchMoreData = async () => {
    const newPosts: Post[] = await fetchPosts(offset);

    setPosts((prev: Post[]) => {
      // 取得済みの配列(prev)の中に、すでに同じIDが存在するかチェック
      const filteredNewPosts = newPosts.filter(
        (newPost) => !prev.some((prevPost) => prevPost.id === newPost.id),
      );
      return [...prev, ...filteredNewPosts]; // 重複を除いた新しい投稿だけを追加
    });

    setOffset((prev) => prev + LIMIT);

    if (newPosts.length < LIMIT) {
      setHasMore(false);
    }
  };

  const { isFetching } = useInfiniteScroll(fetchMoreData, hasMore);

  // 初回マウント時のみデータ取得
  useEffect(() => {
    fetchMoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Home</h1>
      </header>

      <main className={styles.timeline}>
        {posts.map((post: Post) => (
          <article key={post.id} className={styles.post}>
            <div className={styles.avatar}></div>
            <div className={styles.postBody}>
              <div className={styles.postMeta}>
                <span className={styles.authorName}>自分</span>
                <span className={styles.date}>
                  ・ {formatDate(post.publishedAt)}
                </span>
              </div>
              <div
                dangerouslySetInnerHTML={{ __html: post.content }}
                className={styles.content}
              />
            </div>
          </article>
        ))}

        {isFetching && <div className={styles.loader}>読み込み中...</div>}
        {!hasMore && posts.length > 0 && (
          <div className={styles.endMessage}>すべての投稿を表示しました</div>
        )}
      </main>
    </div>
  );
}

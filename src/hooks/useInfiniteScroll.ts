import { useState, useEffect, useCallback } from "react";

const useInfiniteScroll = (
  fetchMoreData: () => Promise<void>,
  hasMore: boolean,
) => {
  const [isFetching, setIsFetching] = useState(false);

  const handleScroll = useCallback(() => {
    // 画面の高さ + スクロール量 < コンテンツ全体の高さ - 10px (誤差吸収用のバッファ) の場合は何もしない
    if (
      window.innerHeight + document.documentElement.scrollTop <
        document.documentElement.offsetHeight - 10 ||
      isFetching ||
      !hasMore
    ) {
      return;
    }
    setIsFetching(true);
  }, [isFetching, hasMore]);

  useEffect(() => {
    if (!isFetching) return;
    fetchMoreData().then(() => {
      setIsFetching(false);
    });
  }, [isFetching, fetchMoreData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return { isFetching };
};

export default useInfiniteScroll;

import { useState, useCallback } from 'react';

export function useNavigation(initialUrl: string = "https://www.google.com") {
  const [url, setUrl] = useState<string>(initialUrl);
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);

  // 处理URL输入变化
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  }, []);

  // 处理URL直接设置
  const setNavigationUrl = useCallback((newUrl: string) => {
    setUrl(newUrl);
    setCurrentUrl(newUrl);
  }, []);

  // 处理导航
  const handleNavigate = useCallback((e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    let processedUrl = url;

    // 检查URL是否有http前缀，没有则添加
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      // 检查是否是一个有效的域名
      if (/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(processedUrl)) {
        processedUrl = "https://" + processedUrl;
      } else {
        // 否则视为搜索词
        processedUrl = `https://www.google.com/search?q=${encodeURIComponent(
          processedUrl
        )}`;
      }
    }

    setCurrentUrl(processedUrl);
    return processedUrl;
  }, [url]);

  return {
    url,
    currentUrl,
    handleUrlChange,
    handleNavigate,
    setNavigationUrl
  };
} 
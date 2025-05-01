import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { Bookmark } from '../components/BookmarkDrawer';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const toast = useToast();

  // 从存储中加载书签
  useEffect(() => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['bookmarks'], (result) => {
        if (result.bookmarks) {
          setBookmarks(result.bookmarks);
        }
      });
    }
  }, []);

  // 添加书签
  const addBookmark = useCallback((title: string, url: string) => {
    try {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title,
        url,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`,
      };

      const updatedBookmarks = [...bookmarks, newBookmark];
      setBookmarks(updatedBookmarks);

      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          toast({
            title: "书签已添加",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        });
      }
    } catch (error) {
      console.error("添加书签时出错:", error);
      toast({
        title: "添加书签失败",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [bookmarks, toast]);

  // 删除书签
  const removeBookmark = useCallback((id: string) => {
    try {
      const updatedBookmarks = bookmarks.filter(
        (bookmark) => bookmark.id !== id
      );
      setBookmarks(updatedBookmarks);

      if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ bookmarks: updatedBookmarks }, () => {
          toast({
            title: "书签已删除",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        });
      }
    } catch (error) {
      console.error("删除书签时出错:", error);
    }
  }, [bookmarks, toast]);

  return {
    bookmarks,
    addBookmark,
    removeBookmark
  };
} 
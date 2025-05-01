import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';

export function useSettings() {
  const [defaultHomepage, setDefaultHomepage] = useState<string>("https://www.google.com");
  const [tempHomepage, setTempHomepage] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const toast = useToast();

  // 从存储中加载设置
  useEffect(() => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['defaultHomepage'], (result) => {
        if (result.defaultHomepage) {
          setDefaultHomepage(result.defaultHomepage);
          setTempHomepage(result.defaultHomepage);
        }
      });
    }
  }, []);

  // 处理设置面板打开
  const handleSettingsOpen = useCallback(() => {
    setTempHomepage(defaultHomepage);
    setIsSettingsOpen(true);
  }, [defaultHomepage]);

  // 处理设置面板关闭
  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // 处理主页输入变化
  const handleHomepageChange = useCallback((value: string) => {
    setTempHomepage(value);
  }, []);

  // 保存设置
  const saveSettings = useCallback((onChangeUrl?: (url: string) => void) => {
    setDefaultHomepage(tempHomepage);
    
    if (onChangeUrl) {
      onChangeUrl(tempHomepage);
    }

    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ defaultHomepage: tempHomepage }, () => {
        toast({
          title: "设置已保存",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      });
    }

    setIsSettingsOpen(false);
  }, [tempHomepage, toast]);

  return {
    defaultHomepage,
    tempHomepage,
    isSettingsOpen,
    handleSettingsOpen,
    handleSettingsClose,
    handleHomepageChange,
    saveSettings
  };
} 
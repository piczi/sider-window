import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Box, Spinner } from "@chakra-ui/react";

interface BrowserProps {
  url: string;
  onUrlChange: (url: string) => void;
  onTitleChange?: (title: string) => void;
}

const Browser = ({ url, onUrlChange, onTitleChange }: BrowserProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe) {
        setIsLoading(false);

        try {
          // 更新地址栏显示的URL
          if (iframe.contentWindow?.location.href) {
            const newUrl = iframe.contentWindow.location.href;
            if (newUrl !== "about:blank") {
              onUrlChange(newUrl);
              
              // 如果提供了标题回调，则传递标题
              if (onTitleChange && iframe.contentDocument?.title) {
                onTitleChange(iframe.contentDocument.title);
              }
            }
          }

          // 拦截所有target="_blank"链接点击，使其在当前iframe内打开
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.addEventListener(
              "click",
              (e) => {
                // 检查点击的是否是链接元素
                const target = e.target as HTMLElement;
                const link = target.closest("a");

                if (link && link.target === "_blank") {
                  e.preventDefault();
                  e.stopPropagation();

                  // 在当前iframe中打开链接
                  const href = link.href;
                  if (href && href !== "#" && !href.startsWith("javascript:")) {
                    setIsLoading(true);
                    iframe.src = href;
                    onUrlChange(href);
                  }

                  return false;
                }
              },
              true
            );
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // 可能会因为跨域限制导致错误，忽略这些错误
          console.log("无法访问iframe内容，可能是跨域限制");
        }
    }
  }, [onUrlChange, onTitleChange]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      // 添加事件监听器
      iframe.addEventListener("load", handleLoad);
      // 清理函数
      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [handleLoad]); // 依赖于 handleLoad

  // 当URL更改时重置加载状态
  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  return (
    <Box flex="1" overflow="hidden" position="relative">
      {isLoading && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Box>
      )}
      <iframe
        ref={iframeRef}
        src={url}
        title="Side Browser"
        width="100%"
        height="100%"
        style={{
          border: "none",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />
    </Box>
  );
};

export default memo(Browser); 
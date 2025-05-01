import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Box,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  IconButton,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

// 书签接口
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

// 书签目录树节点类型
export interface BookmarkTreeNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkTreeNode[];
}

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onAddBookmark: () => void;
  onRemoveBookmark: (id: string) => void;
  onOpenBookmark: (url: string) => void;
}

const BookmarkDrawer = ({
  isOpen,
  onClose,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  onOpenBookmark,
}: BookmarkDrawerProps) => {
  const [chromeBookmarks, setChromeBookmarks] = useState<BookmarkTreeNode[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState<boolean>(false);
  const [bookmarksReady, setBookmarksReady] = useState<boolean>(false);
  
  // 颜色模式配置 - 移到组件顶层
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const textHoverColor = useColorModeValue("blue.500", "blue.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bookmarkBgHover = useColorModeValue("gray.100", "gray.700");
  const bookmarkTextHover = useColorModeValue("blue.500", "blue.200");
  const addBookmarkBg = useColorModeValue("blue.50", "blue.900");
  const addBookmarkBgHover = useColorModeValue("blue.100", "blue.800");

  // 获取Chrome浏览器的书签
  const loadChromeBookmarks = () => {
    if (chrome.bookmarks && chrome.bookmarks.getTree) {
      setLoadingBookmarks(true);
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        setChromeBookmarks(bookmarkTreeNodes);
        setLoadingBookmarks(false);
      });
    }
  };

  // 在打开书签抽屉时自动加载Chrome书签
  useEffect(() => {
    if (isOpen) {
      setBookmarksReady(false); // 重置书签准备状态
      loadChromeBookmarks();
    }
  }, [isOpen]);

  // 当书签数据加载完成后处理展开
  useEffect(() => {
    if (chromeBookmarks.length > 0 && !bookmarksReady) {
      // 给书签内容一点时间加载完全
      const timer = setTimeout(() => {
        setBookmarksReady(true);
      }, 500); // 增加延迟时间确保内容加载

      return () => clearTimeout(timer);
    }
  }, [chromeBookmarks]);

  // 渲染书签树节点的递归组件
  const renderBookmarkTreeNode = (node: BookmarkTreeNode) => {
    // 如果节点有URL，则它是一个书签
    if (node.url) {
      return (
        <Box
          key={node.id}
          p={2}
          borderRadius="md"
          display="flex"
          alignItems="center"
          className="bookmark-item"
          _hover={{ bg: hoverBgColor }}
        >
          <Box mr={2}>
            <img
              src={`https://www.google.com/s2/favicons?domain=${
                new URL(node.url).hostname
              }`}
              alt="favicon"
              width="16"
              height="16"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </Box>
          <Text
            flex="1"
            fontSize="sm"
            isTruncated
            cursor="pointer"
            onClick={() => onOpenBookmark(node.url!)}
            _hover={{ color: textHoverColor, textDecoration: "underline" }}
          >
            {node.title || "书签"}
          </Text>
        </Box>
      );
    }

    // 如果没有URL但有子节点，则它是一个文件夹
    if (node.children && node.children.length > 0) {
      return (
        <AccordionItem key={node.id} border="none">
          <AccordionButton
            py={1}
            px={2}
            borderRadius="md"
            _hover={{ bg: hoverBgColor }}
          >
            <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">
              {node.title || "书签"}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={2} pt={1} px={1}>
            <VStack
              spacing={1}
              align="stretch"
              pl={2}
              borderLeftWidth="2px"
              borderLeftColor={borderColor}
            >
              {node.children.map((childNode) => renderBookmarkTreeNode(childNode))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      );
    }

    // 空文件夹
    return (
      <Box key={node.id} p={2} fontSize="sm" color="gray.500">
        {node.title} (空)
      </Box>
    );
  };

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">书签</DrawerHeader>
        <DrawerBody p={2}>
          <Tabs isFitted variant="enclosed" colorScheme="blue">
            <TabList mb="1em">
              <Tab>我的书签</Tab>
              <Tab>浏览器书签</Tab>
            </TabList>
            <TabPanels>
              {/* 我的书签选项卡 */}
              <TabPanel>
                <VStack spacing={2} align="stretch">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                      <Box
                        key={bookmark.id}
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        className="bookmark-item"
                        _hover={{
                          bg: bookmarkBgHover,
                        }}
                      >
                        {bookmark.favicon && (
                          <Box mr={2}>
                            <img
                              src={bookmark.favicon}
                              alt="favicon"
                              width="16"
                              height="16"
                            />
                          </Box>
                        )}
                        <Box flex="1" isTruncated>
                          <Text
                            cursor="pointer"
                            onClick={() => onOpenBookmark(bookmark.url)}
                            _hover={{
                              color: bookmarkTextHover,
                              textDecoration: "underline",
                            }}
                          >
                            {bookmark.title || bookmark.url}
                          </Text>
                        </Box>
                        <IconButton
                          size="xs"
                          colorScheme="red"
                          aria-label="Remove bookmark"
                          icon={<Text>✕</Text>}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveBookmark(bookmark.id);
                          }}
                        />
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500" py={2} textAlign="center">
                      暂无自定义书签
                    </Text>
                  )}
                  <Box
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    backgroundColor={addBookmarkBg}
                    textAlign="center"
                    cursor="pointer"
                    onClick={onAddBookmark}
                    _hover={{
                      backgroundColor: addBookmarkBgHover,
                    }}
                  >
                    添加当前页面到书签
                  </Box>
                </VStack>
              </TabPanel>

              {/* 浏览器书签选项卡 */}
              <TabPanel>
                {loadingBookmarks ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="md" color="blue.500" />
                    <Text mt={2}>加载中...</Text>
                  </Box>
                ) : chromeBookmarks.length > 0 && bookmarksReady ? (
                  <Box maxH="70vh" overflow="auto">
                    <Accordion allowMultiple>
                      {chromeBookmarks.map((node) => renderBookmarkTreeNode(node))}
                    </Accordion>
                  </Box>
                ) : (
                  <VStack spacing={4} py={4} align="center">
                    <Text color="gray.500">
                      {chromeBookmarks.length > 0
                        ? "准备中..."
                        : "未能加载浏览器书签"}
                    </Text>
                    {chromeBookmarks.length === 0 && (
                      <IconButton
                        colorScheme="blue"
                        aria-label="Reload bookmarks"
                        icon={<SearchIcon />}
                        onClick={loadChromeBookmarks}
                      />
                    )}
                    {chromeBookmarks.length > 0 && (
                      <Spinner size="sm" color="blue.500" />
                    )}
                  </VStack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default BookmarkDrawer; 
import { useState, useRef, useEffect } from "react";
import {
	ChakraProvider,
	Box,
	Input,
	InputGroup,
	InputRightElement,
	IconButton,
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	VStack,
	Text,
	useDisclosure,
	useToast,
	Spinner,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	useColorMode,
	useColorModeValue,
	Button,
} from "@chakra-ui/react";
import {
	SearchIcon,
	StarIcon,
	MoonIcon,
	SunIcon,
	SettingsIcon,
} from "@chakra-ui/icons";
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import "./App.css";

// 定义主题配置
const config: ThemeConfig = {
	initialColorMode: "system",
	useSystemColorMode: true,
};

// 扩展主题
const theme = extendTheme({ config });

interface Bookmark {
	id: string;
	title: string;
	url: string;
	favicon?: string;
}

// 书签目录树节点类型
interface BookmarkTreeNode {
	id: string;
	title: string;
	url?: string;
	children?: BookmarkTreeNode[];
}

function App() {
	const [url, setUrl] = useState<string>("https://www.google.com");
	const [currentUrl, setCurrentUrl] = useState<string>(
		"https://www.google.com"
	);
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [chromeBookmarks, setChromeBookmarks] = useState<BookmarkTreeNode[]>(
		[]
	);
	const [loadingBookmarks, setLoadingBookmarks] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [defaultHomepage, setDefaultHomepage] = useState<string>(
		"https://www.google.com"
	);
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
	const [tempHomepage, setTempHomepage] = useState<string>("");
	// 延迟渲染书签树，确保加载完成后再显示
	const [bookmarksReady, setBookmarksReady] = useState<boolean>(false);
	// const [, setExpandedIndices] = useState<number[]>([]);

	const iframeRef = useRef<HTMLIFrameElement>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const { colorMode, toggleColorMode } = useColorMode();

	const inputBgColor = useColorModeValue("white", "gray.700");

	// 从Chrome存储中加载保存的设置
	useEffect(() => {
		if (chrome.storage && chrome.storage.sync) {
			chrome.storage.sync.get(["bookmarks", "defaultHomepage"], (result) => {
				if (result.bookmarks) {
					setBookmarks(result.bookmarks);
				}

				if (result.defaultHomepage) {
					setDefaultHomepage(result.defaultHomepage);
					setTempHomepage(result.defaultHomepage);
					setUrl(result.defaultHomepage);
					setCurrentUrl(result.defaultHomepage);

					if (iframeRef.current) {
						iframeRef.current.src = result.defaultHomepage;
					}
				}
			});
		}
	}, []);

	// 获取Chrome浏览器的书签
	const loadChromeBookmarks = () => {
		if (chrome.bookmarks && chrome.bookmarks.getTree) {
			setLoadingBookmarks(true);
			chrome.bookmarks.getTree((bookmarkTreeNodes) => {
				setChromeBookmarks(bookmarkTreeNodes);
				setLoadingBookmarks(false);
			});
		} else {
			toast({
				title: "无法访问浏览器书签",
				description: "请确保扩展有访问书签的权限",
				status: "error",
				duration: 3000,
				isClosable: true,
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
			// 先计算需要展开的节点
			// const indices = getDefaultExpandedIndices(chromeBookmarks);
			// setExpandedIndices(indices);

			// 给书签内容一点时间加载完全
			const timer = setTimeout(() => {
				setBookmarksReady(true);
			}, 500); // 增加延迟时间确保内容加载

			return () => clearTimeout(timer);
		}
	}, [chromeBookmarks]);

	console.log("Current bookmarks:", chromeBookmarks, "");

	// // 获取顶层书签文件夹的索引，以便默认展开
	// const getDefaultExpandedIndices = (
	// 	bookmarks: BookmarkTreeNode[]
	// ): number[] => {
	// 	const indices: number[] = [];
	// 	// 默认仅展开前1-2个主要书签文件夹
	// 	if (bookmarks && bookmarks.length > 0 && bookmarks[0].children) {
	// 		// 书签栏通常是第一个子节点
	// 		const bookmarkBar = bookmarks[0].children.findIndex(
	// 			(node) =>
	// 				node.title === "书签栏" ||
	// 				node.title === "Bookmarks Bar" ||
	// 				node.title === "书签栏" ||
	// 				node.title.includes("Bookmark")
	// 		);

	// 		if (bookmarkBar !== -1) {
	// 			indices.push(bookmarkBar);
	// 		} else if (bookmarks[0].children.length > 0) {
	// 			// 如果找不到书签栏，就展开第一个文件夹
	// 			indices.push(0);
	// 		}
	// 	}
	// 	return indices;
	// };

	// 处理iframe加载事件
	useEffect(() => {
		const iframe = iframeRef.current;
		if (iframe) {
			const handleLoad = () => {
				setIsLoading(false);

				try {
					// 更新地址栏显示的URL
					if (iframe.contentWindow?.location.href) {
						const newUrl = iframe.contentWindow.location.href;
						if (newUrl !== "about:blank") {
							setCurrentUrl(newUrl);
							setUrl(newUrl);
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
										setCurrentUrl(href);
										setUrl(href);
									}

									return false;
								}
							},
							true
						);
					}
				} catch (error) {
					// 可能会因为跨域限制导致错误，忽略这些错误
					console.log("无法访问iframe内容，可能是跨域限制");
				}
			};

			// 添加事件监听器
			iframe.addEventListener("load", handleLoad);
			// 清理函数
			return () => {
				iframe.removeEventListener("load", handleLoad);
			};
		}
	}, []);

	// 处理URL输入
	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUrl(e.target.value);
	};

	// 处理导航
	const handleNavigate = (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

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

		if (iframeRef.current) {
			iframeRef.current.src = processedUrl;
		}
	};

	// 添加书签
	const addBookmark = () => {
		try {
			const newBookmark: Bookmark = {
				id: Date.now().toString(),
				title: iframeRef.current?.contentDocument?.title || currentUrl,
				url: currentUrl,
				favicon: `https://www.google.com/s2/favicons?domain=${
					new URL(currentUrl).hostname
				}`,
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
	};

	// 删除书签
	const removeBookmark = (id: string) => {
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
	};

	// 打开书签链接
	const openBookmark = (url: string) => {
		setIsLoading(true);
		setCurrentUrl(url);
		setUrl(url);

		if (iframeRef.current) {
			iframeRef.current.src = url;
		}

		onClose();
	};

	// 渲染书签树节点的递归组件
	const renderBookmarkTreeNode = (node: BookmarkTreeNode) => {
		// 为深色模式优化的hover颜色
		const hoverBgColor = useColorModeValue("gray.100", "gray.700");
		const textHoverColor = useColorModeValue("blue.500", "blue.200");
		const borderColor = useColorModeValue("gray.200", "gray.600");

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
						onClick={() => openBookmark(node.url!)}
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
							{node.children.map((childNode) =>
								renderBookmarkTreeNode(childNode)
							)}
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

	// 处理设置界面打开和关闭
	const handleSettingsOpen = () => {
		setTempHomepage(defaultHomepage);
		setIsSettingsOpen(true);
	};

	const handleSettingsClose = () => {
		setIsSettingsOpen(false);
	};

	// 处理默认主页输入
	const handleHomepageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTempHomepage(e.target.value);
	};

	// 保存设置
	const saveSettings = () => {
		setDefaultHomepage(tempHomepage);
		setUrl(tempHomepage);
		setCurrentUrl(tempHomepage);

		if (iframeRef.current) {
			iframeRef.current.src = tempHomepage;
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
	};

	return (
		<ChakraProvider theme={theme}>
			<Box height="100vh" display="flex" flexDirection="column">
				{/* 地址栏和书签按钮 */}
				<Box p={2} borderBottom="1px" borderColor="gray.200">
					<form onSubmit={handleNavigate}>
						<InputGroup size="md">
							<Input
								pr="7rem"
								type="text"
								placeholder="输入网址或搜索"
								value={url}
								onChange={handleUrlChange}
							/>
							<InputRightElement width="7rem">
								<IconButton
									h="1.75rem"
									size="sm"
									aria-label="Search"
									icon={<SearchIcon />}
									type="submit"
								/>
								<IconButton
									h="1.75rem"
									size="sm"
									ml={1}
									colorScheme="yellow"
									aria-label="Bookmark"
									icon={<StarIcon />}
									onClick={onOpen}
								/>
								<IconButton
									h="1.75rem"
									size="sm"
									ml={1}
									colorScheme="blue"
									aria-label="Settings"
									icon={<SettingsIcon />}
									onClick={handleSettingsOpen}
								/>
							</InputRightElement>
						</InputGroup>
					</form>
				</Box>

				{/* 嵌入式浏览器 */}
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
						src={currentUrl}
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

				{/* 书签抽屉 */}
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
															bg: useColorModeValue("gray.100", "gray.700"),
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
																onClick={() => openBookmark(bookmark.url)}
																_hover={{
																	color: useColorModeValue(
																		"blue.500",
																		"blue.200"
																	),
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
																removeBookmark(bookmark.id);
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
												backgroundColor={useColorModeValue(
													"blue.50",
													"blue.900"
												)}
												textAlign="center"
												cursor="pointer"
												onClick={addBookmark}
												_hover={{
													backgroundColor: useColorModeValue(
														"blue.100",
														"blue.800"
													),
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
										) : (chromeBookmarks.length > 0 && bookmarksReady) ? (
											<Box maxH="70vh" overflow="auto">
												<Accordion allowMultiple>
													{chromeBookmarks.map((node) =>
														renderBookmarkTreeNode(node)
													)}
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

				{/* 设置抽屉 */}
				<Drawer
					isOpen={isSettingsOpen}
					placement="right"
					onClose={handleSettingsClose}
					size="md"
				>
					<DrawerOverlay />
					<DrawerContent>
						<DrawerCloseButton />
						<DrawerHeader borderBottomWidth="1px">设置</DrawerHeader>
						<DrawerBody p={2}>
							<VStack spacing={4} align="stretch">
								<Box>
									<Text mb={2}>默认主页</Text>
									<Input
										type="text"
										placeholder="输入默认主页"
										value={tempHomepage}
										onChange={handleHomepageChange}
										bg={inputBgColor}
									/>
								</Box>
								<Box>
									<Text mb={2}>主题</Text>
									<Button onClick={toggleColorMode}>
										{colorMode === "light" ? <MoonIcon /> : <SunIcon />}
									</Button>
								</Box>
								<Button colorScheme="blue" onClick={saveSettings}>
									保存设置
								</Button>
							</VStack>
						</DrawerBody>
					</DrawerContent>
				</Drawer>
			</Box>
		</ChakraProvider>
	);
}

export default App;

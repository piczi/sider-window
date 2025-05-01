import { useRef, useEffect } from "react";
import { ChakraProvider, Box, useDisclosure, extendTheme, type ThemeConfig } from "@chakra-ui/react";
import "./App.css";

// 导入自定义组件
import AddressBar from "./components/AddressBar";
import Browser from "./components/Browser";
import BookmarkDrawer from "./components/BookmarkDrawer";
import SettingsDrawer from "./components/SettingsDrawer";

// 导入自定义 Hooks
import { useNavigation } from "./hooks/useNavigation";
import { useBookmarks } from "./hooks/useBookmarks";
import { useSettings } from "./hooks/useSettings";

// 定义主题配置
const config: ThemeConfig = {
	initialColorMode: "system",
	useSystemColorMode: true,
};

// 扩展主题
const theme = extendTheme({ config });

function App() {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();
	
	// 使用自定义 Hooks
	const { 
		bookmarks, 
		addBookmark, 
		removeBookmark 
	} = useBookmarks();
	
	const {
		defaultHomepage,
		tempHomepage,
		isSettingsOpen,
		handleSettingsOpen,
		handleSettingsClose,
		handleHomepageChange,
		saveSettings
	} = useSettings();
	
	const {
		url,
		currentUrl,
		handleUrlChange,
		handleNavigate,
		setNavigationUrl
	} = useNavigation(defaultHomepage);

	// 设置初始主页
	useEffect(() => {
		setNavigationUrl(defaultHomepage);
	}, [defaultHomepage, setNavigationUrl]);

	// 添加当前页面到书签
	const handleAddBookmark = () => {
		try {
			// 从 URL 中提取域名作为默认标题
			const urlObj = new URL(currentUrl);
			const defaultTitle = urlObj.hostname.replace('www.', '');
			
			// 尝试从 iframe 获取标题，如果失败则使用默认标题
			let title = defaultTitle;
			try {
				if (iframeRef.current?.contentDocument?.title) {
					title = iframeRef.current.contentDocument.title;
				}
			} catch (error) {
				// 忽略跨域错误，使用默认标题
				console.log('无法获取页面标题，使用默认标题');
			}
			
			// 添加时间戳使标题更唯一
			title = `${title} - ${new Date().toLocaleString()}`;
			
			addBookmark(title, currentUrl);
		} catch (error) {
			console.error('添加书签失败:', error);
		}
	};

	// 打开书签链接
	const handleOpenBookmark = (bookmarkUrl: string) => {
		setNavigationUrl(bookmarkUrl);
		
		if (iframeRef.current) {
			iframeRef.current.src = bookmarkUrl;
		}
		
		onClose();
	};

	// 处理设置保存并更新主页
	const handleSaveSettings = () => {
		saveSettings((newUrl) => {
			setNavigationUrl(newUrl);
			
			if (iframeRef.current) {
				iframeRef.current.src = newUrl;
			}
		});
	};

	return (
		<ChakraProvider theme={theme}>
			<Box height="100vh" display="flex" flexDirection="column">
				{/* 地址栏 */}
				<AddressBar
					url={url}
					onUrlChange={handleUrlChange}
					onNavigate={handleNavigate}
					onBookmarkOpen={onOpen}
					onSettingsOpen={handleSettingsOpen}
				/>

				{/* 浏览器 */}
				<Browser
					url={currentUrl}
					onUrlChange={setNavigationUrl}
				/>

				{/* 书签抽屉 */}
				<BookmarkDrawer
					isOpen={isOpen}
					onClose={onClose}
					bookmarks={bookmarks}
					onAddBookmark={handleAddBookmark}
					onRemoveBookmark={removeBookmark}
					onOpenBookmark={handleOpenBookmark}
				/>

				{/* 设置抽屉 */}
				<SettingsDrawer
					isOpen={isSettingsOpen}
					onClose={handleSettingsClose}
					defaultHomepage={tempHomepage}
					onHomepageChange={handleHomepageChange}
					onSave={handleSaveSettings}
				/>
			</Box>
		</ChakraProvider>
	);
}

export default App;

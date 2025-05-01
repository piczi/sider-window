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
		if (iframeRef.current) {
			const title = iframeRef.current.contentDocument?.title || currentUrl;
			addBookmark(title, currentUrl);
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

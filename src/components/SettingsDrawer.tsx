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
  Button,
  Input,
  useColorMode,
  useColorModeValue
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultHomepage: string;
  onHomepageChange: (value: string) => void;
  onSave: () => void;
}

const SettingsDrawer = ({
  isOpen,
  onClose,
  defaultHomepage,
  onHomepageChange,
  onSave
}: SettingsDrawerProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const inputBgColor = useColorModeValue("white", "gray.700");

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
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
                value={defaultHomepage}
                onChange={(e) => onHomepageChange(e.target.value)}
                bg={inputBgColor}
              />
            </Box>
            <Box>
              <Text mb={2}>主题</Text>
              <Button onClick={toggleColorMode}>
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
            </Box>
            <Button colorScheme="blue" onClick={onSave}>
              保存设置
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer; 
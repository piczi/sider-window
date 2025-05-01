import { 
  Box, 
  Input, 
  InputGroup, 
  InputRightElement, 
  IconButton 
} from "@chakra-ui/react";
import { SearchIcon, StarIcon, SettingsIcon } from "@chakra-ui/icons";

interface AddressBarProps {
  url: string;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigate: (e: React.FormEvent) => void;
  onBookmarkOpen: () => void;
  onSettingsOpen: () => void;
}

const AddressBar = ({ 
  url, 
  onUrlChange, 
  onNavigate, 
  onBookmarkOpen, 
  onSettingsOpen 
}: AddressBarProps) => {
  return (
    <Box p={2} borderBottom="1px" borderColor="gray.200">
      <form onSubmit={onNavigate}>
        <InputGroup size="md">
          <Input
            pr="7rem"
            type="text"
            placeholder="输入网址或搜索"
            value={url}
            onChange={onUrlChange}
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
              onClick={onBookmarkOpen}
            />
            <IconButton
              h="1.75rem"
              size="sm"
              ml={1}
              colorScheme="blue"
              aria-label="Settings"
              icon={<SettingsIcon />}
              onClick={onSettingsOpen}
            />
          </InputRightElement>
        </InputGroup>
      </form>
    </Box>
  );
}

export default AddressBar; 
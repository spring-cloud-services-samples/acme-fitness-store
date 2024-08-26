import React, {useEffect, useRef, useState} from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Button,
    Paper,
    Typography
} from '@mui/material';
import {Close, Refresh, Send} from '@mui/icons-material';
import {useChatService} from './hooks/useChatService';
import {createMarkup, summarizeCart} from "./utils/helpers.ts";

interface ChatModalProps {
    open: boolean;
    onClose: () => void;
    productId: string | null;
    cartData: any;
}

export default function ChatModal({open, onClose, cartData}: ChatModalProps) {
    const [inputMessage, setInputMessage] = useState('');
    const {chatHistory, suggestedPrompts, sendMessage, refreshChat, isLoading, error} = useChatService();
    const [jiggle, setJiggle] = useState(false);
    const closeButtonRef = useRef(null);

    const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
        if (reason !== 'backdropClick') {
            onClose();
        } else {
            handleBackdropClick();
        }
    };

    const handleSend = (message: string) => {
        if (message.trim()) {
            sendMessage(message, summarizeCart(cartData.cart));
            setInputMessage('');
        }
    };

    const handleBackdropClick = () => {
        setJiggle(true);
        if (closeButtonRef.current) {
            closeButtonRef.current.style.transform = 'scale(2.5)';
        }
        setTimeout(() => {
            setJiggle(false);
            if (closeButtonRef.current) {
                closeButtonRef.current.style.transform = 'scale(1)';
            }
        }, 500);
    };

    // to appease the screenreaders
    useEffect(() => {
        if (open) {
            document.querySelectorAll('body > *:not(#chat-dialog)').forEach((element) => {
                element.setAttribute('inert', 'true');
            });
        } else {
            document.querySelectorAll('[inert]').forEach((element) => {
                element.removeAttribute('inert');
            });
        }

        return () => {
            document.querySelectorAll('[inert]').forEach((element) => {
                element.removeAttribute('inert');
            });
        };
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            disableEnforceFocus
            hideBackdrop
            disableScrollLock
            PaperProps={{
                sx: {
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    m: 0,
                    width: 420,
                    height: 600,
                    pointerEvents: 'auto',

                },
            }}
        >
            <DialogTitle
                sx={{padding: '8px 16px', margin: 0, '& h3': {margin: 0, fontSize: '1.2rem', lineHeight: 1.2}, '& h6': {margin: '4px 0 0 0', fontSize: '0.8rem', lineHeight: 1, fontWeight: 'heavy', color: 'green'}}}>
                <h3>Chat with FitAssist</h3>
                <h6>Powered by SpringAI</h6>
                <IconButton
                    ref={closeButtonRef}
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        animation: jiggle ? 'jiggle 0.5s ease-in-out' : 'none',
                        transition: 'transform 0.2s',
                        '@keyframes jiggle': {
                            '0%': {transform: 'rotate(0deg)'},
                            '25%': {transform: 'rotate(-5deg) scale(2.5)'},
                            '50%': {transform: 'rotate(5deg) scale(2.5)'},
                            '75%': {transform: 'rotate(-5deg) scale(2.5)'},
                            '100%': {transform: 'rotate(0deg)'},
                        },
                    }}
                >
                    <Close/>
                </IconButton>
                <IconButton
                    aria-label="refresh"
                    onClick={refreshChat}
                    sx={{position: 'absolute', right: 48, top: 8}}
                >
                    <Refresh/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{p: 1}}>
                <List sx={{height: 450, overflow: 'auto'}}>
                    {chatHistory.map((message, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                justifyContent: message.role === 'USER' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 1,
                                    maxWidth: '70%',
                                    backgroundColor: message.role === 'USER' ? 'primary.light' : 'grey.200',
                                    borderRadius: message.role === 'USER' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                }}
                            >
                                <ListItemText
                                    primary={<span dangerouslySetInnerHTML={createMarkup(message.content)}/>}
                                    sx={{
                                        wordBreak: 'break-word',
                                        '& .MuiListItemText-primary': {
                                            color: message.role === 'USER' ? 'primary.contrastText' : 'text.primary',
                                        }
                                    }}
                                />
                            </Paper>
                        </ListItem>
                    ))}
                </List>
                {isLoading && (<Typography variant="body2"
                                           sx={{position: 'absolute', bottom: 100, left: 16, color: 'text.secondary'}}>FitAssist
                    is currently typing...</Typography>)}
                {error && (
                    <Paper sx={{p: 1, mt: 1, backgroundColor: 'error.light', color: 'error.contrastText'}}>
                        Error: {error.message}
                    </Paper>
                )}
            </DialogContent>
            <DialogActions sx={{p: 2, justifyContent: 'space-between'}}>
                <TextField
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    sx={{flexGrow: 1, mr: 1}}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputMessage.trim() && !isLoading) {
                            e.preventDefault();
                            handleSend(inputMessage);
                        }
                    }}
                />
                <Button
                    variant="contained"
                    endIcon={<Send/>}
                    onClick={() => handleSend(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                >
                    Send
                </Button>
            </DialogActions>
        </Dialog>
    );
};
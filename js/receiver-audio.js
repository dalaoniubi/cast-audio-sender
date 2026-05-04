/**
 * 纯音频 Cast 接收器
 * 精简版 - 移除智能显示屏相关功能
 */

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();

// 日志工具
const LOG_TAG = 'AudioReceiver';
const logger = {
  info: (msg) => console.log(`[INFO] ${LOG_TAG}:`, msg),
  warn: (msg) => console.warn(`[WARN] ${LOG_TAG}:`, msg),
  error: (msg) => console.error(`[ERROR] ${LOG_TAG}:`, msg)
};

// 判断是否是有效的 URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 拦截 LOAD 请求
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    logger.info('收到播放请求');

    const contentId = request.media.contentId;
    logger.info('Content ID: ' + contentId);

    // 直接播放 URL
    if (isValidUrl(contentId)) {
      request.media.contentUrl = contentId;
      
      // 判断音频格式
      if (contentId.endsWith('.m4a') || contentId.endsWith('.mp3') || 
          contentId.endsWith('.aac') || contentId.endsWith('.ogg')) {
        request.media.contentType = 'audio/mp4';
        logger.info('音频格式: audio/mp4');
      } else if (contentId.endsWith('.mpd')) {
        request.media.contentType = 'application/dash+xml';
      } else if (contentId.endsWith('.m3u8')) {
        request.media.contentType = 'application/x-mpegurl';
      }
      
      // 设置音频元数据
      if (!request.media.metadata) {
        request.media.metadata = new cast.framework.messages.GenericMediaMetadata();
      }
      request.media.metadata.title = request.media.metadata.title || '音频';
      
      logger.info('准备播放: ' + contentId);
      return Promise.resolve(request);
    }
    
    // 无法识别的内容
    logger.error('无法识别的内容: ' + contentId);
    return Promise.reject(new Error('Unsupported content'));
  }
);

// 监听播放状态（可选，用于调试）
playerManager.addEventListener(
  cast.framework.events.EventType.PLAYING,
  () => logger.info('开始播放')
);

playerManager.addEventListener(
  cast.framework.events.EventType.PAUSE,
  () => logger.info('暂停播放')
);

playerManager.addEventListener(
  cast.framework.events.EventType.ENDED,
  () => logger.info('播放结束')
);

// 启动接收器
context.start();
logger.info('音频接收器已启动');

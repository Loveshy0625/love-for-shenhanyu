/**
 * 照片预加载脚本
 * 在页面加载时提前缓存所有照片，提升显示速度
 */

(function() {
    // 所有需要预加载的照片列表
    var imagesToPreload = [
        // 偶像相关
        'img/朴彩英.jpg',
        'img/朴彩英rose.jpg',
        'img/cxk.jpg',
        
        // 我们的照片
        'img/第一次见面.jpg',
        'img/第一次见面的花.png',
        'img/国庆节.jpg',
        'img/国庆节副本.jpg',
        'img/国庆节花花.jpg',
        'img/元旦的我们.png',
        'img/元旦礼物.jpg',
        'img/元旦礼物副本.png',
        
        // 游戏角色
        'img/西施.jpg',
        'img/园丁.jpg',
        'img/调香师.jpg',
        'img/02.jpg',
        
        // 动漫角色
        'img/巴卫和娜娜米.jpg',
        'img/巴卫和nanami.jpg',
        'img/冰公主.jpg',
        'img/微信图片冰公主.jpg',
        'img/微信图片冰公主1.jpg',
        'img/库洛米.jpg',
        
        // 其他图片
        'img/微信图片_20260307151253_717_16.jpg',
        'img/微信图片_20260307151517_722_16.jpg',
        'img/微信图片_20260307151519_723_16.jpg',
        'img/微信图片_20260307155036_855_16.jpg',
        'img/微信图片_20260307173702_78_13.jpg',
        'img/微信图片_20260307173702_79_13.jpg',
        'img/微信图片_20260307173702_80_13.jpg',
        'img/微信图片_20260307173702_81_13.jpg',
        'img/微信图片_20260307173702_82_13.jpg',
        'img/微信图片_20260307173702_83_13.jpg',
        'img/微信图片_20260307173702_84_13.jpg',
        'img/微信图片_影院.jpg'
    ];

    var loadedCount = 0;
    var totalCount = imagesToPreload.length;

    console.log('📸 开始预加载照片，共 ' + totalCount + ' 张...');

    // 预加载每张照片
    imagesToPreload.forEach(function(src) {
        var img = new Image();
        
        img.onload = function() {
            loadedCount++;
            console.log('✅ 已加载：' + src + ' (' + loadedCount + '/' + totalCount + ')');
            
            // 所有照片加载完成
            if (loadedCount === totalCount) {
                console.log('🎉 所有照片预加载完成！');
            }
        };
        
        img.onerror = function() {
            console.warn('❌ 加载失败：' + src);
            loadedCount++;
        };
        
        // 开始加载
        img.src = src;
    });

    // 暴露预加载状态到全局
    window.imagesPreloaded = false;
    window.checkImagesPreloaded = function() {
        return loadedCount === totalCount;
    };

})();

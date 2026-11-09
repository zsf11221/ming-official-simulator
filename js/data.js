// 浮世千年·洪武仕途 —— 微信小游戏版数据
// 只借鉴旧版设定（洪武十一年知县开局、断案劝农、结亲育子、朝廷考课、家族传承），
// 事件、数值、文案均为本仓库原创，不复制旧版代码。
(function (root) {
  var DATA = {};

  DATA.VERSION = '1.0.0'; // 全仓库唯一版本号，别处不要再写别的版本
  DATA.START_YEAR = 1378; // 洪武十一年
  DATA.COUNTY = '清河县';
  DATA.RULES = '规则透明：每年做3个抉择；三年一考课，政绩达到下一级门槛且在任满3年就升官，政绩<20贬谪；贪墨风险≥80被弹劾罢官；健康≤0病逝任上；民心≤0民变罢官；70岁致仕。官库银两是公产，不可付私事；俸余才是个人钱。';
  DATA.START_AGE = 26;
  DATA.EVAL_EVERY = 3; // 三年一考课
  DATA.DECISIONS_PER_YEAR = 3;

  // 出身三选一（借鉴旧版设定，数值按本游戏经济比例调整）：寒门士子学识+4、官库银-10、民心+2
  DATA.ORIGINS = [
    { id: 'hanmen', name: '寒门士子', desc: '村里凑钱供你读书，学识+4，银钱-10两，民心+2。', bonus: { minxin: 2, silver: -10, xueshi: 4 } },
    { id: 'shuxiang', name: '地方书香之家', desc: '祖上出过举人，家道中落，书还在。', bonus: { shengwang: 8, silver: -20, xueshi: 6 } },
    { id: 'yimin', name: '战乱遗民', desc: '战乱中活下来，最懂百姓苦。', bonus: { minxin: 8, jiankang: 5, silver: -10 } }
  ];
  // 天赋三选一（借鉴旧版）
  DATA.TALENTS = [
    { id: 'jingshi', name: '经世之才', desc: '政绩获取+1/次抉择。', bonus: { zhili: 6 } },
    { id: 'qinglian', name: '清廉刚直', desc: '贪墨风险-10开局，廉洁抉择收益更高。', bonus: { dexing: 8, tanmo: -10 } },
    { id: 'bamian', name: '八面玲珑', desc: '人脉+10，上官类抉择收益更高。', bonus: { renmai: 10 } }
  ];
  // 六维：治理、学识、财计、统御、德行、体魄（借鉴旧版六维，轻量显示）
  DATA.SIX_DIMS = [
    { id: 'zhili', name: '治理' }, { id: 'xueshi', name: '学识' }, { id: 'caiji', name: '财计' },
    { id: 'tongyu', name: '统御' }, { id: 'dexing', name: '德行' }, { id: 'tipo', name: '体魄' }
  ];
  // 天下风云编年 1380-1402（只作背景风声，不渲染细节）
  DATA.TIMELINE = [
    { year: 1380, text: '天下风云：胡惟庸案起，朝中人人自危。' },
    { year: 1382, text: '天下风云：马皇后去世，宫中举哀。' },
    { year: 1385, text: '天下风云：《大诰》颁行，天下皆读。' },
    { year: 1392, text: '天下风云：太子朱标去世，朝野震动。' },
    { year: 1393, text: '天下风云：蓝玉案起，牵连甚广。' },
    { year: 1398, text: '天下风云：太祖驾崩，建文即位。' },
    { year: 1399, text: '天下风云：靖难之役起，天下多事。' }
  ];

  // 官职表（游戏化简化：洪武十三年废丞相后无丞相，首辅为后期叫法，此处作顶级目标）
  DATA.RANKS = [
    { name: '知县', pin: '正七品', need: 0, salary: 12 },
    { name: '知州', pin: '从五品', need: 40, salary: 20 },
    { name: '知府', pin: '正四品', need: 65, salary: 30 },
    { name: '布政使', pin: '从二品', need: 90, salary: 45 },
    { name: '六部侍郎', pin: '正二品', need: 115, salary: 60 },
    { name: '六部尚书', pin: '正二品', need: 140, salary: 80 },
    { name: '内阁首辅', pin: '正一品', need: 999, salary: 110 }
  ];

  DATA.EQUIPS = [
    { id: 'guanfu', name: '官服', desc: '每级政绩获取+2', max: 5, baseCost: 20 },
    { id: 'guanyin', name: '官印', desc: '断案类抉择收益+2', max: 5, baseCost: 20 },
    { id: 'kaoshan', name: '靠山', desc: '每级考课政绩要求-3', max: 5, baseCost: 30 },
    { id: 'mensheng', name: '门生', desc: '每年声望+2/级', max: 5, baseCost: 25 },
    { id: 'liangtian', name: '良田', desc: '每年粮食+15/级、银两+5/级', max: 5, baseCost: 25 },
    { id: 'hufu', name: '护身符', desc: '每年健康+2/级', max: 5, baseCost: 20 }
  ];

  // 事件：id / 类别 / 标题 / 正文 / 选项[{文案, 效果, 结果}]
  // 效果键：silver grain minxin shengwang zhengji jiankang caixue renmai gongji
  DATA.EVENTS = [
    { id: 'e01', cat: '断案', title: '张三偷牛案', text: '张三偷了李四一头牛，牛找回来了，人还押在堂下。李四要重罚，张三说家里孩子饿了三天。', choices: [
      { text: '按律杖二十，赔牛', effect: { zhengji: 4, minxin: 2, shengwang: 1 }, result: '杖责之后，张三去给李四家帮了三个月短工。县里说你判得公道。' },
      { text: '罚他给李四家种一季地', effect: { minxin: 6, zhengji: 2, grain: 5 }, result: '一季之后，两家反倒成了亲家。' },
      { text: '各打五十大板了事', effect: { minxin: -4, zhengji: -2 }, result: '两边都不服，衙门口吵了半个月。' } ] },
    { id: 'e02', cat: '劝农', title: '春耕缺牛', text: '春耕到了，全县只有七头牛，十户人家轮一头，急得团团转。', choices: [
      { text: '官府出钱再买三头牛', effect: { silver: -25, grain: 25, minxin: 6, zhengji: 4 }, result: '牛到了，春耕没误。今年收成有指望。' },
      { text: '让大户先借牛给小户', effect: { minxin: 3, shengwang: 2, zhengji: 2 }, result: '大户不太乐意，但面子给了，牛也借了。' },
      { text: '先等等，看天吃饭', effect: { grain: -15, minxin: -5 }, result: '误了农时，秋收少了两成。' } ] },
    { id: 'e03', cat: '兴学', title: '县学屋顶漏了', text: '县学的屋顶漏雨，孩子们拿着书往没漏的地方挤，先生说再漏下去就没法上课了。', choices: [
      { text: '拨银修缮，再添十套书', effect: { silver: -20, shengwang: 6, zhengji: 4, caixue: 2 }, result: '修好那天，孩子们齐声念书，声音传到街上。' },
      { text: '先修一半，凑合用', effect: { silver: -8, shengwang: 2 }, result: '漏得少了，但下大雨还是得挪桌子。' },
      { text: '等上头拨款再说', effect: { shengwang: -4, minxin: -3 }, result: '先生辞了两个，学生跑了一半。' } ] },
    { id: 'e04', cat: '水利', title: '河堤有个口子', text: '城外河堤裂了个口子，现在看着不大，汛期一到就是大事。', choices: [
      { text: '征民夫抢修，加高堤坝', effect: { silver: -30, grain: -10, minxin: -2, zhengji: 6 }, result: '汛期来了，堤没垮。百姓嘴上骂你征发，心里服气。' },
      { text: '只补口子，不加高', effect: { silver: -12, zhengji: 2 }, result: '今年平安，明年还得再补。' },
      { text: '写个奏折请朝廷拨款', effect: { zhengji: -2, grain: -10 }, result: '奏折还没回音，雨先来了。' } ] },
    { id: 'e05', cat: '赈灾', title: '邻县灾民到了', text: '邻县遭了蝗灾，几十户灾民逃到本县城外，讨口饭吃。', choices: [
      { text: '开仓放粮，设粥棚', effect: { grain: -30, silver: -10, minxin: 8, shengwang: 5, zhengji: 5 }, result: '粥棚前排了长队，有人给你磕了个头。' },
      { text: '收留青壮做工，以工代赈', effect: { grain: -10, minxin: 5, zhengji: 4, silver: 5 }, result: '灾民修了路，也挣了口粮，两全。' },
      { text: '劝他们回原籍', effect: { minxin: -8, shengwang: -5 }, result: '人是走了，骂名留下了。' } ] },
    { id: 'e06', cat: '家族', title: '说亲的人来了', text: '邻村顾氏来提亲，姑娘贤惠（旧版顾氏95两）；京官陆氏也来提亲，陪嫁更厚（旧版陆氏165两，按本游戏经济比例缩小）。夫人问你这门亲结不结？', choices: [
      { text: '结顾氏，热热闹闹办一场（俸余-15）', effect: { privateSilver: -15, minxin: 3, shengwang: 3 }, result: '办了三天流水席，全县都来喝喜酒。顾氏成了你的妻。' },
      { text: '结陆氏，京官亲家（俸余-25，人脉+3）', effect: { privateSilver: -25, renmai: 3, shengwang: 4 }, result: '陆氏过门，京官亲家这层关系，关键时刻能用上。' },
      { text: '先定亲，等三年再办', effect: { silver: -5, shengwang: 1 }, result: '亲定了，心也定了。' },
      { text: '推了，怕人说攀附', effect: { shengwang: 1, minxin: -2 }, result: '王家有点不高兴，但也没说什么。' } ] },
    { id: 'e07', cat: '家族', title: '孩子满周岁了', text: '儿子满周岁，抓周抓了支笔。老母亲说这孩子将来也是读书的料。', choices: [
      { text: '请先生开蒙，好好培养', effect: { silver: -10, caixue: 3, shengwang: 2 }, result: '孩子三岁能背三字经，街坊都夸。' },
      { text: '先放养着，长大再说', effect: { silver: 0 }, result: '孩子整天在院子里追鸡，也挺快乐。' },
      { text: '送去亲戚家学手艺', effect: { silver: 5, minxin: 1 }, result: '孩子学了木匠，倒也有一技之长。' } ] },
    { id: 'e08', cat: '上官', title: '知府大人路过', text: '知府大人巡查路过本县，要在县衙歇一晚。师爷问：备什么规格招待？', choices: [
      { text: '家常便饭，实话实说', effect: { silver: -5, shengwang: 4, zhengji: 2 }, result: '知府吃了顿农家饭，夸你不扰民。' },
      { text: '备一桌好席，再送点土产', effect: { silver: -20, renmai: 3, zhengji: 2 }, result: '知府吃得满意，走时拍了拍你的肩。' },
      { text: '装病不见', effect: { renmai: -4, zhengji: -3 }, result: '知府记下了，说你架子大。' } ] },
    { id: 'e09', cat: '考课', title: '三年考课的风声', text: '吏部考课快到了，同僚说这次看重钱粮和民心两项，你心里得有个数。', choices: [
      { text: '连夜核对钱粮账目', effect: { zhengji: 4, jiankang: -3 }, result: '账目清清楚楚，考课时心里不慌。' },
      { text: '去乡下走一圈听民声', effect: { minxin: 4, zhengji: 3 }, result: '百姓说你还行，有两件小事得马上办。' },
      { text: '托人打听考课的门道', effect: { silver: -10, renmai: 2 }, result: '门道是打听到了，就是有点费钱。' } ] },
    { id: 'e10', cat: '断案', title: '寡妇争产案', text: '寡妇带着两个孩子，和亡夫的兄弟争三间房。族老各执一词，案子拖了半年。', choices: [
      { text: '房子判给寡妇母子', effect: { minxin: 6, zhengji: 3, shengwang: 2 }, result: '寡妇当堂给你磕了个头，族老也没再闹。' },
      { text: '房子兄弟两家平分', effect: { minxin: 1, zhengji: 1 }, result: '谁都不太满意，但也没人再告了。' },
      { text: '让族里自己商量', effect: { minxin: -4, zhengji: -2 }, result: '族里商量了三个月，还是没结果。' } ] },
    { id: 'e11', cat: '劝农', title: '有人想改种棉花', text: '几个大户想把水田改种棉花，赚钱多，但粮食就少了。', choices: [
      { text: '压住，只许种两成棉花', effect: { grain: 10, silver: 5, zhengji: 3 }, result: '粮食保住了，棉花也赚了点，算是折中。' },
      { text: '随他们去，多种多赚', effect: { silver: 15, grain: -20, minxin: -3 }, result: '棉花是赚钱了，粮价涨了，百姓有怨言。' },
      { text: '全县禁种棉花', effect: { grain: 5, minxin: -5, shengwang: -2 }, result: '大户们背后骂你死脑筋。' } ] },
    { id: 'e12', cat: '兴学', title: '穷孩子交不起束脩', text: '县学里有五个穷孩子交不起束脩，先生说再不交就只能退学了。', choices: [
      { text: '自掏腰包替他们交了', effect: { silver: -12, shengwang: 6, minxin: 4 }, result: '五个孩子留下了，家长们逢人就夸你。' },
      { text: '让他们半耕半读', effect: { shengwang: 2, minxin: 2 }, result: '孩子们白天种地晚上读书，辛苦但没退学。' },
      { text: '按规矩办，该退就退', effect: { shengwang: -4, minxin: -4 }, result: '规矩是守了，人心凉了。' } ] },
    { id: 'e13', cat: '水利', title: '新挖一口井', text: '城东那片地没水井，百姓要走二里地挑水，有人提议新挖一口。', choices: [
      { text: '官府出钱挖，百姓出力', effect: { silver: -15, minxin: 6, zhengji: 3 }, result: '井打好了，出水那天全村都来看。' },
      { text: '让百姓自己凑钱挖', effect: { minxin: 1, silver: 0 }, result: '凑了三个月，钱还没凑齐。' },
      { text: '先记下来，明年再说', effect: { minxin: -3 }, result: '百姓挑水又挑了一年。' } ] },
    { id: 'e14', cat: '赈灾', title: '疫病起了', text: '县里起了疫病，郎中说要隔离、要熬药，药材钱不是小数目。', choices: [
      { text: '拨银买药，设隔离棚', effect: { silver: -30, grain: -5, minxin: 7, zhengji: 5, jiankang: -2 }, result: '疫病半个月就压下去了，没死几个人。' },
      { text: '只熬药，不隔离', effect: { silver: -12, minxin: 2, jiankang: -4 }, result: '病拖了一个月，你也病了一场。' },
      { text: '贴告示让大家自己小心', effect: { minxin: -6, jiankang: -5 }, result: '疫病蔓延，县里人心惶惶。' } ] },
    { id: 'e15', cat: '风声', title: '京城的风声', text: '京城传来风声，说胡惟庸的事还没完，朝中人人自危。师爷问你：要不要写封信表忠心？', choices: [
      { text: '老老实实办差，不掺和', effect: { zhengji: 2, shengwang: 2 }, result: '风声过去了，你还在原地，没升也没降。' },
      { text: '写封奏折表忠心', effect: { renmai: 2, zhengji: 1, silver: -5 }, result: '奏折递上去了，石沉大海。' },
      { text: '到处打听内幕', effect: { renmai: -3, jiankang: -2 }, result: '内幕没打听到，倒惹了一身臊。' } ] },
    { id: 'e16', cat: '断案', title: '夜里有人偷粮', text: '粮仓夜里丢了两袋粮，守仓的说是老鼠，你觉得不像。', choices: [
      { text: '彻查，抓住是内贼', effect: { zhengji: 4, silver: 5, shengwang: 2 }, result: '查出来是守仓的监守自盗，粮追回来了。' },
      { text: '补上缺口，不声张', effect: { silver: -8, minxin: 1 }, result: '粮是补上了，但贼还在。' },
      { text: '罚守仓的一个月饷', effect: { silver: 3, minxin: -2 }, result: '守仓的不服，干活开始磨洋工。' } ] },
    { id: 'e17', cat: '劝农', title: '蝗虫来了', text: '蝗虫从北边来了，遮天蔽日，眼看就要吃光庄稼。', choices: [
      { text: '组织全县灭蝗，鸡鸭齐上', effect: { grain: -10, minxin: 5, zhengji: 5 }, result: '蝗虫灭了大半，保住了六成收成。' },
      { text: '请神拜佛求蝗虫走', effect: { silver: -8, grain: -25, minxin: -3 }, result: '蝗虫没走，庄稼没了。' },
      { text: '先保官田，再管民田', effect: { grain: -5, minxin: -8, shengwang: -4 }, result: '官田保住了，民心丢了。' } ] },
    { id: 'e18', cat: '兴学', title: '先生想辞馆', text: '县学里最好的先生想辞馆去府城，说这里束脩太低。', choices: [
      { text: '涨束脩，再给间房子', effect: { silver: -18, caixue: 4, shengwang: 3 }, result: '先生留下了，还多招了二十个学生。' },
      { text: '好言挽留，不加钱', effect: { caixue: 1, shengwang: 1 }, result: '先生勉强留下，心里不太痛快。' },
      { text: '走就走，再请一个', effect: { caixue: -3, shengwang: -2 }, result: '新先生水平一般，学生少了一半。' } ] },
    { id: 'e19', cat: '家族', title: '母亲病了', text: '老母亲病了，郎中说要静养，药不能停。你手头正紧。', choices: [
      { text: '买最好的药，再请个郎中常驻', effect: { silver: -25, jiankang: 2, shengwang: 3 }, result: '母亲好了，还能给你纳鞋底了。' },
      { text: '按方子抓药，自己照料', effect: { silver: -8, jiankang: -2 }, result: '母亲慢慢好了，你瘦了一圈。' },
      { text: '先顾公务，药缓一缓', effect: { silver: 0, jiankang: -4, shengwang: -3 }, result: '母亲病了一个月，你心里一直过意不去。' } ] },
    { id: 'e20', cat: '上官', title: '上官要你“行个方便”', text: '上官的亲戚在本县犯了事，上官托人捎话：行个方便，日后好相见。', choices: [
      { text: '按律办，该怎么判怎么判', effect: { zhengji: 4, shengwang: 5, renmai: -3 }, result: '案子判了，上官那边冷了你半年。' },
      { text: '大事化小，罚点银子了事', effect: { silver: 8, renmai: 2, shengwang: -3, zhengji: -2 }, result: '事是平了，百姓背后说你怕上官。' },
      { text: '拖着不办，等风头过去', effect: { zhengji: -3, minxin: -2 }, result: '拖了三个月，两边都不满意。' } ] },
    { id: 'e21', cat: '断案', title: '两村争水', text: '上游村和下游村为争水械斗，打伤了三个人，都告到县衙来了。', choices: [
      { text: '定个分水时辰，立碑为证', effect: { minxin: 6, zhengji: 4 }, result: '碑立在河边，两村再没为水打过架。' },
      { text: '各打五十大板，回去种地', effect: { minxin: -2, zhengji: 0 }, result: '人是回去了，气还没消。' },
      { text: '偏向人多的那个村', effect: { minxin: -5, shengwang: -3 }, result: '小村不服，告到了府里。' } ] },
    { id: 'e22', cat: '劝农', title: '有人开荒', text: '几个流民想在荒山开荒，要官府给个准话，还要免三年税。', choices: [
      { text: '准了，免三年税，还借粮种', effect: { grain: -15, silver: -5, minxin: 7, zhengji: 5 }, result: '三年后荒山变良田，多了五十户人家。' },
      { text: '准开荒，不免税', effect: { minxin: 2, zhengji: 2 }, result: '开了荒，但人走了一半。' },
      { text: '不准，荒山留着', effect: { minxin: -4, grain: 0 }, result: '流民走了，荒山还是荒山。' } ] },
    { id: 'e23', cat: '水利', title: '修桥还是修路', text: '县里有点结余，百姓一半想修桥，一半想修路，吵到县衙来了。', choices: [
      { text: '修桥，孩子上学近了', effect: { silver: -25, minxin: 5, shengwang: 3, zhengji: 3 }, result: '桥修好了，上学不用绕远了。' },
      { text: '修路，运粮方便了', effect: { silver: -25, grain: 10, minxin: 4, zhengji: 3 }, result: '路修好了，粮车能直接到村口。' },
      { text: '一半一半，都修点', effect: { silver: -25, minxin: 2, zhengji: 1 }, result: '桥也修了路也修了，就是都不太结实。' } ] },
    { id: 'e24', cat: '赈灾', title: '粮价涨了', text: '邻县灾荒，粮商囤粮，县里粮价翻了一倍，百姓买不起粮。', choices: [
      { text: '开仓平粜，压住粮价', effect: { grain: -25, minxin: 7, zhengji: 4 }, result: '粮价压下来了，粮商恨你，百姓爱你。' },
      { text: '罚囤粮的粮商', effect: { silver: 10, minxin: 4, shengwang: -1 }, result: '粮商罚了钱，粮价降了一点。' },
      { text: '随行就市，不管', effect: { minxin: -7, grain: -5 }, result: '粮价越涨越高，有人开始逃荒。' } ] },
    { id: 'e25', cat: '考课', title: '考课前有人送礼', text: '考课前夜，有人送来一箱银子，说是“一点心意”，求你在考课文书上“美言几句”。', choices: [
      { text: '退回去，照实写', effect: { zhengji: 3, shengwang: 4, silver: 0 }, result: '银子退了，考课文书照实写，心里坦荡。' },
      { text: '收下，美言几句', effect: { silver: 30, zhengji: -4, shengwang: -5 }, result: '银子是收了，夜里睡不踏实。' },
      { text: '收下，转手赈了灾民', effect: { silver: 0, minxin: 4, zhengji: -1 }, result: '银子没进自己口袋，但规矩还是破了。' } ] },
    { id: 'e26', cat: '家族', title: '女儿要出嫁', text: '女儿到了出嫁年纪，男方家境一般，但人老实。夫人问你嫁妆给多少？', choices: [
      { text: '多陪嫁妆，风风光光嫁', effect: { silver: -20, shengwang: 3, minxin: 2 }, result: '嫁得风光，女儿过门就当家。' },
      { text: '按规矩办，不多不少', effect: { silver: -8, shengwang: 1 }, result: '规规矩矩，也挺好。' },
      { text: '少陪点，留着给儿子读书', effect: { silver: 0, caixue: 2, shengwang: -2 }, result: '女儿有点委屈，但也没说什么。' } ] },
    { id: 'e27', cat: '断案', title: '戏班子告状', text: '戏班子在庙会演戏，被人砸了场子，班主告到县衙，要个说法。', choices: [
      { text: '抓了砸场子的人，赔戏班子', effect: { minxin: 4, zhengji: 3 }, result: '戏班子又唱起来了，庙会热闹了。' },
      { text: '各退一步，赔一半', effect: { minxin: 1, zhengji: 1 }, result: '事平了，戏班子下次不来了。' },
      { text: '这是民间纠纷，不管', effect: { minxin: -4, zhengji: -2 }, result: '戏班子走了，庙会冷清了。' } ] },
    { id: 'e28', cat: '劝农', title: '养蚕还是种田', text: '有几户想养蚕，桑叶不够，要官府帮忙种桑树。', choices: [
      { text: '种桑树，三年见效', effect: { silver: -12, grain: -5, minxin: 4, zhengji: 3 }, result: '三年后桑叶有了，蚕丝卖了好价钱。' },
      { text: '先试点五户', effect: { silver: -5, minxin: 2 }, result: '五户赚了，明年全村都要养。' },
      { text: '种田稳当，别折腾', effect: { grain: 5, minxin: -2 }, result: '田是稳当，但也没多赚。' } ] },
    { id: 'e29', cat: '兴学', title: '府试放榜了', text: '府试放榜，本县中了三个秀才，是近十年最好的一次。', choices: [
      { text: '大摆宴席庆祝，再奖银子', effect: { silver: -15, shengwang: 6, caixue: 3 }, result: '宴席上，三个秀才给你敬了酒。' },
      { text: '发个告示表扬一下', effect: { shengwang: 3 }, result: '告示贴出去了，全县都知道了。' },
      { text: '知道了，忙公务去', effect: { shengwang: -1 }, result: '秀才们有点失落。' } ] },
    { id: 'e30', cat: '风声', title: '空印案的风声', text: '听说朝廷在查空印案，账目先盖印后填数的事，各地都在自查。', choices: [
      { text: '连夜自查账目，补齐手续', effect: { zhengji: 3, jiankang: -3, silver: -5 }, result: '账目补齐了，查到你这里没出事。' },
      { text: '账目没问题，不用查', effect: { zhengji: 1 }, result: '查了一圈，你这里确实干净。' },
      { text: '托人打听查到哪了', effect: { silver: -8, renmai: 1 }, result: '打听到查得不严，松了口气。' } ] },
    { id: 'e31', cat: '断案', title: '牛丢了又回来了', text: '李四的牛丢了三天又自己回来了，还多了头小牛犊。李四和张三又为小牛犊是谁的吵起来了。', choices: [
      { text: '小牛犊归李四，张三赔礼', effect: { minxin: 3, zhengji: 2 }, result: '张三认了，还请李四喝了顿酒。' },
      { text: '小牛犊两家一人一半', effect: { minxin: 1 }, result: '没法分，最后折成银子分了。' },
      { text: '充公，归县学养着', effect: { minxin: -3, shengwang: -2 }, result: '两家都不服，说你和稀泥。' } ] },
    { id: 'e32', cat: '劝农', title: '冬小麦冻了', text: '冬天特别冷，冬小麦冻死了一片，来年收成要打折。', choices: [
      { text: '拨粮救济，再补种春麦', effect: { grain: -20, minxin: 6, zhengji: 3 }, result: '春麦补上了，收成保住大半。' },
      { text: '减免受灾户的税', effect: { silver: -10, minxin: 5 }, result: '税减了，百姓缓过劲来了。' },
      { text: '等开春再说', effect: { grain: -10, minxin: -4 }, result: '开春再看，已经晚了。' } ] },
    { id: 'e33', cat: '水利', title: '山洪冲了路', text: '一场暴雨，山洪冲断了进城的路，运粮的车进不来了。', choices: [
      { text: '带人抢修，三天通路', effect: { silver: -18, grain: 5, minxin: 5, zhengji: 4, jiankang: -2 }, result: '路通了，粮车进来了。' },
      { text: '绕远路运粮', effect: { silver: -10, grain: -5 }, result: '粮是运进来了，费了不少事。' },
      { text: '等水退了再说', effect: { grain: -15, minxin: -4 }, result: '水退了，粮价已经涨上去了。' } ] },
    { id: 'e34', cat: '赈灾', title: '流民里有读书人', text: '流民里有个落魄举人，会写会算，想在县衙谋个差事。', choices: [
      { text: '留下来当文书', effect: { silver: -8, caixue: 4, zhengji: 3, shengwang: 2 }, result: '文书一上任，衙门账目清楚多了。' },
      { text: '给他盘缠送走', effect: { silver: -5, shengwang: 1 }, result: '人走了，留了封谢信。' },
      { text: '让他和灾民一起修路', effect: { minxin: 1 }, result: '读书人修路，修得不太像样。' } ] },
    { id: 'e35', cat: '家族', title: '儿子想从军', text: '儿子十六了，不想读书，想去卫所从军，挣个前程。', choices: [
      { text: '随他去，男儿当自强', effect: { shengwang: 2, jiankang: 0 }, result: '儿子从军去了，三年后捎信回来立了功。' },
      { text: '按住他，必须读书', effect: { caixue: 3, shengwang: -1 }, result: '儿子读书去了，心里不太服气。' },
      { text: '先读书，考不上再从军', effect: { caixue: 2 }, result: '折中了，儿子也没话说。' } ] },
    { id: 'e36', cat: '上官', title: '上官的题字', text: '上官来视察，兴致来了要题字，问县衙大堂挂什么字好？', choices: [
      { text: '请题“明镜高悬”', effect: { renmai: 2, shengwang: 3 }, result: '字挂上了，来告状的人先看一眼字。' },
      { text: '请题“清正廉明”', effect: { renmai: 2, zhengji: 2 }, result: '字挂上了，你每天进门都看一眼。' },
      { text: '说大堂已有字，不劳费心', effect: { renmai: -3 }, result: '上官觉得你不给面子。' } ] },
    { id: 'e37', cat: '断案', title: '赌坊闹事', text: '县里赌坊有人输急了眼，砸了摊子，还打伤了人。', choices: [
      { text: '封了赌坊，重罚庄家', effect: { minxin: 5, zhengji: 4, shengwang: 2 }, result: '赌坊封了，县里清净了不少。' },
      { text: '罚点银子，继续开', effect: { silver: 12, minxin: -4, shengwang: -3 }, result: '银子是进了账，骂名也留下了。' },
      { text: '劝赌徒回家，别管庄家', effect: { minxin: -2, zhengji: -1 }, result: '赌徒回家了，赌坊还在开。' } ] },
    { id: 'e38', cat: '劝农', title: '稻田养鱼', text: '有人提议稻田里养鱼，一田两收，就是怕鱼把禾苗拱坏了。', choices: [
      { text: '试点十亩', effect: { grain: 5, silver: 5, minxin: 3 }, result: '鱼长大了，稻子也没坏，明年全县推广。' },
      { text: '全县推广', effect: { grain: -10, silver: 10, minxin: -2 }, result: '一半人赚了，一半人赔了。' },
      { text: '别折腾，老实种稻', effect: { grain: 5 }, result: '稻子稳稳当当。' } ] },
    { id: 'e39', cat: '兴学', title: '女孩子想读书', text: '几个女孩子想进县学旁听，先生说从没这规矩。', choices: [
      { text: '特许旁听，另设女塾', effect: { silver: -10, shengwang: 6, minxin: 4 }, result: '女塾办起来了，县里头一份。' },
      { text: '让她们在家学', effect: { shengwang: 1 }, result: '在家学也行，就是没先生教。' },
      { text: '按规矩，不许', effect: { shengwang: -3, minxin: -2 }, result: '规矩守了，女孩子们失望了。' } ] },
    { id: 'e40', cat: '风声', title: '郭桓案的风声', text: '听说户部侍郎郭桓贪了上千万石粮，朝廷正在严查，各地钱粮都要重核。', choices: [
      { text: '主动上交账目请查', effect: { zhengji: 4, shengwang: 3 }, result: '查了一圈，你这里干干净净。' },
      { text: '等查到再说', effect: { zhengji: 0 }, result: '查到了，也没查出你什么。' },
      { text: '托人打听查案的尺度', effect: { silver: -8, renmai: 1 }, result: '尺度是打听到了，心里有底了。' } ] },
    { id: 'e41', cat: '断案', title: '墙倒压死人', text: '大户家的墙倒了，压死了路过的挑夫，大户说赔钱，死者家属要命。', choices: [
      { text: '大户赔钱又修墙，家属谅解', effect: { minxin: 5, zhengji: 3 }, result: '钱赔了，墙修了，家属也不闹了。' },
      { text: '只赔钱，不管修墙', effect: { minxin: 1, zhengji: 1 }, result: '钱是赔了，墙还是歪的。' },
      { text: '这是天灾，各认倒霉', effect: { minxin: -6, zhengji: -3 }, result: '家属告到了府里。' } ] },
    { id: 'e42', cat: '劝农', title: '种桑还是种粮', text: '丝价涨了，有人想把粮田改桑田，赚钱是赚钱，粮食怎么办？', choices: [
      { text: '只许旱地种桑，水田种粮', effect: { silver: 8, grain: 5, zhengji: 3 }, result: '桑也种了，粮也保住了。' },
      { text: '全改桑田', effect: { silver: 20, grain: -25, minxin: -4 }, result: '丝是赚钱了，粮得去外县买。' },
      { text: '不许改，全种粮', effect: { grain: 8, minxin: -3 }, result: '粮是保住了，赚钱的机会没了。' } ] },
    { id: 'e43', cat: '水利', title: '水车坏了', text: '村里水车坏了，灌溉跟不上，村里凑钱修，差二十两。', choices: [
      { text: '官府补二十两', effect: { silver: -20, grain: 15, minxin: 5 }, result: '水车转起来了，田里有水了。' },
      { text: '让村里再凑凑', effect: { minxin: 1 }, result: '凑了一个月，终于凑齐了。' },
      { text: '先记账，明年修', effect: { grain: -10, minxin: -3 }, result: '今年灌溉误了，收成少了。' } ] },
    { id: 'e44', cat: '赈灾', title: '雪灾压塌房', text: '大雪压塌了十几间民房，百姓无处安身。', choices: [
      { text: '开仓拨粮，组织修房', effect: { grain: -20, silver: -10, minxin: 7, zhengji: 4 }, result: '房修好了，百姓有了住处。' },
      { text: '先搭窝棚凑合', effect: { grain: -5, minxin: 2 }, result: '窝棚搭起来了，冷是冷了点。' },
      { text: '等雪化了再说', effect: { minxin: -6, jiankang: -3 }, result: '雪化了，有人病倒了。' } ] },
    { id: 'e45', cat: '考课', title: '考课文书怎么写', text: '三年考课，文书上写政绩，师爷问你：实话实说，还是往好了写？', choices: [
      { text: '实话实说，有一说一', effect: { zhengji: 3, shengwang: 3 }, result: '文书写上去了，上面说你老实。' },
      { text: '往好了写一点', effect: { zhengji: 2, shengwang: -1 }, result: '写好了，考课好看了一点。' },
      { text: '往坏了写，留余地', effect: { zhengji: -2, shengwang: 1 }, result: '写坏了，上面觉得你太谦虚。' } ] },
    { id: 'e46', cat: '家族', title: '老父亲想回乡', text: '老父亲想回乡养老，家里田产都在老家，你走不开。', choices: [
      { text: '送父亲回乡，再派人照料', effect: { silver: -10, shengwang: 3 }, result: '父亲回乡了，乡亲们都说你孝顺。' },
      { text: '留父亲在县里养老', effect: { silver: -5, shengwang: 2 }, result: '父亲留下了，每天去街上遛弯。' },
      { text: '先忙公务，回头再说', effect: { shengwang: -2, jiankang: -2 }, result: '父亲等了一年，有点失落。' } ] },
    { id: 'e47', cat: '断案', title: '有人告你', text: '有人写状子告你，说你断案不公。状子递到府里了。', choices: [
      { text: '请府里重审，清者自清', effect: { zhengji: 2, shengwang: 3 }, result: '重审了，你判得没错。' },
      { text: '私下和解，给点补偿', effect: { silver: -12, minxin: 1 }, result: '和解了，但总觉得憋屈。' },
      { text: '不理他，爱告告去', effect: { zhengji: -3, shengwang: -3 }, result: '告状的人越告越凶。' } ] },
    { id: 'e48', cat: '劝农', title: '新粮种', text: '外地来了个新粮种，据说产量高一成，就是没人种过。', choices: [
      { text: '试点二十亩', effect: { grain: 10, minxin: 3 }, result: '试点成功了，明年全县推广。' },
      { text: '全县推广', effect: { grain: -15, silver: 5 }, result: '一半地增产，一半地绝收。' },
      { text: '不种，老粮种稳当', effect: { grain: 3 }, result: '老粮种稳稳当当。' } ] },
    { id: 'e49', cat: '兴学', title: '县志要重修', text: '县志十几年没修了，府里催着重修，要钱要人。', choices: [
      { text: '拨银修志，请老先生主笔', effect: { silver: -15, shengwang: 5, caixue: 3 }, result: '县志修好了，你的名字写在序里。' },
      { text: '简单修一下', effect: { silver: -5, shengwang: 1 }, result: '修是修了，潦草了点。' },
      { text: '拖着，等下任修', effect: { shengwang: -3 }, result: '府里催了三次，你还没动。' } ] },
    { id: 'e50', cat: '风声', title: '蓝玉案的风声（后期）', text: '多年后京城又起风声，说蓝玉的事牵连甚广。你如今已不是小小知县，站队要小心。', choices: [
      { text: '不站队，只办差', effect: { zhengji: 2, shengwang: 2 }, result: '风声过去了，你还在。' },
      { text: '赶紧表忠心', effect: { renmai: 2, silver: -5 }, result: '表了忠心，心里不太踏实。' },
      { text: '称病闭门不出', effect: { jiankang: 2, zhengji: -2 }, result: '病是装的，门是真关了。' } ] },
    { id: 'e51', cat: '上官', title: '同僚请客', text: '同僚升官请客，席上有人劝你“别太清高”，话里有话。', choices: [
      { text: '笑着应付，不接话', effect: { renmai: 1, shengwang: 1 }, result: '席吃完了，话也没接，人也没得罪。' },
      { text: '当场反驳，清者自清', effect: { shengwang: 3, renmai: -2 }, result: '话是说出去了，同僚记下了。' },
      { text: '借故离席', effect: { renmai: -2 }, result: '席没吃完，人先走了。' } ] },
    { id: 'e52', cat: '家族', title: '孙子出生了', text: '孙子出生了，老母亲抱着孙子笑得合不拢嘴，说咱家有后了。', choices: [
      { text: '大办满月酒', effect: { silver: -12, shengwang: 3, minxin: 2 }, result: '满月酒摆了三天，全县都来道喜。' },
      { text: '小办一下，一家人吃顿饭', effect: { silver: -3, shengwang: 1 }, result: '一家人吃顿饭，也挺热闹。' },
      { text: '公务忙，满月再说', effect: { shengwang: -1 }, result: '满月过了，酒还没摆。' } ] },
    { id: 'e53', cat: '断案', title: '陈年旧案', text: '翻出一桩十年前的旧案，当年判错了人，人已经死了，家属来讨说法。', choices: [
      { text: '翻案，给家属平反', effect: { minxin: 7, shengwang: 5, zhengji: 3 }, result: '案子翻了，家属给你立了块碑。' },
      { text: '按旧案维持，不翻', effect: { minxin: -5, shengwang: -3 }, result: '家属告到了京城。' },
      { text: '补偿银子，不翻案', effect: { silver: -15, minxin: 2 }, result: '银子给了，案子还是错的。' } ] },
    { id: 'e54', cat: '劝农', title: '退田还湖', text: '有人提议把湖边田退了还湖，防洪好，但种田的人不干。', choices: [
      { text: '退一半，补一半', effect: { grain: -5, minxin: 3, zhengji: 3 }, result: '湖大了，洪水小了，田也还够种。' },
      { text: '全退还湖', effect: { grain: -20, minxin: -5, zhengji: 2 }, result: '湖是大了，种田的人没饭吃了。' },
      { text: '不退，继续种', effect: { grain: 5, minxin: -2 }, result: '田是保住了，洪水来了还是怕。' } ] }
  ];

  // 借鉴旧版实测事件（按本游戏经济比例缩小）：招民垦荒 / 商队遭劫
  DATA.EVENTS.push(
    { id: 'e55', cat: '劝农', title: '招民垦荒', text: '荒地闲着也是闲着，招流民来垦荒，旧版实测125两/3月，耕地370→470亩、户数300→327、人口1000→1095。本游戏按年结算，比例缩小。', choices: [
      { text: '拨官库银25两招民垦荒', effect: { silver: -25, mu: 100, households: 27, population: 95, minxin: 5, zhengji: 4 }, result: '荒地变良田，多了二十七户人家。' },
      { text: '只招人不拨银', effect: { mu: 30, households: 10, population: 30, minxin: 2 }, result: '人是来了，地开得慢。' },
      { text: '不招，荒着吧', effect: { minxin: -2 }, result: '荒地还是荒地。' } ] },
    { id: 'e56', cat: '断案', title: '商队遭劫', text: '过路商队在城外遭劫，货物被抢了一半，商队首领告到县衙，请你拨银缉盗。', choices: [
      { text: '拨银缉盗，治安+6', effect: { silver: -12, zhian: 6, zhengji: 3, shengwang: 2 }, result: '盗贼抓住了，商队又敢走这条路了。' },
      { text: '让商队自己雇人护送', effect: { zhian: 1 }, result: '商队雇了镖师，走了。' },
      { text: '不管，城外不归我管', effect: { zhian: -5, minxin: -3, shengwang: -2 }, result: '商队绕道走了，县里少了笔买卖。' } ] }
  );
  DATA.POSTER_LINES = {
    shoufu: ['一纸任命，半生浮沉。', '从残破小县，一路走到首辅。', '这辈子，值了。'],
    zhishi: ['致仕还乡，功成身退。', '官做完了，日子还要过。', '回乡种田去，也挺好。'],
    bian: ['贬谪边疆，宦海沉浮。', '这一贬，贬掉了半辈子。', '边疆风大，且行且珍惜。'],
    minbian: ['民心尽失，罢官归乡。', '百姓不认你，官也就做到头了。'],
    bingshi: ['鞠躬尽瘁，病逝任上。', '这一生，交给了这方水土。'],
    bangguan: ['被弹劾罢官，黯然离场。', '宦海风波，说来就来。'],
    chuancheng: ['一代人有一代人的仕途。', '子嗣接棒，家业不倒。']
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DATA;
  else root.MingData = DATA;
})(typeof window !== 'undefined' ? window : globalThis);

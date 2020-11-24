<!DOCTYPE html>
<html lang="ja" prefix="og: http://ogp.me/ns#">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<meta property="og:title" content="第1回電竜戦 <?php echo htmlspecialchars($_GET["gn"]) ?> <?php echo $tesuuStr ?> <?php echo $mStr ?> まで"/>
<meta property="og:description" content="第1回電竜戦 <?php echo htmlspecialchars($_GET["gn"]) ?> <?php echo $tesuuStr ?> <?php echo $mStr ?> まで"/>
<meta property="og:site_name" content="電竜戦"/>
<meta property="og:image" content="https://sylwi.mzr.jp/cimg_denryu.php?p=<?php echo htmlspecialchars($_GET["p"]) ?>"/>
<meta property="og:url" content="https://sylwi.mzr.jp/#/<?php echo urlencode($_GET["tn"]) ?>/<?php echo urlencode($_GET["gi"]) ?>/<?php echo $tesuu ?>"/>
<meta property="og:locale" content="ja_JP"/>
<meta property="og:type" content="article"/>
<meta name="twitter:card" content="summary_large_image"/>
<title>第1回電竜戦 <?php echo htmlspecialchars($_GET["gn"]) ?></title>
<style>
body, iframe {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  border: 0;
}
</style>
</head>
<body>
  <iframe src="https://sylwi.mzr.jp/#/<?php echo urlencode($_GET["tn"]) ?>/<?php echo urlencode($_GET["gi"]) ?>/<?php echo $tesuu ?>"></iframe>
</body>
</html>

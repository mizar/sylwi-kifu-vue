<?php
include('./psfenw.php');

// フォント
$font4 = 'font/NotoSansCJKjp-Regular.woff';
$font7 = 'font/NotoSansCJKjp-Bold.woff';

// アライン付き文字の描画
// $_xpos; 0:左寄せ 1:中央寄せ 2:右寄せ
// $_ypos; 0:上寄せ 1:中央寄せ 2:下寄せ
function aligntext($_im, $_size, $_angle, $_x, $_y, $_color, $_fontfile, $_text, $_xpos = 1, $_ypos = 1)
{
  // バウンディングボックス
  $_bound = imagettfbbox($_size, $_angle, $_fontfile, $_text);
  $_xmin = min($_bound[0], $_bound[2], $_bound[4], $_bound[6]);
  $_xmax = max($_bound[0], $_bound[2], $_bound[4], $_bound[6]);
  $_ymin = min($_bound[1], $_bound[3], $_bound[5], $_bound[7]);
  $_ymax = max($_bound[1], $_bound[3], $_bound[5], $_bound[7]);
  $_dx = -($_xmin * (2 - $_xpos) + $_xmax * $_xpos) / 2;
  $_dy = -($_ymin * (2 - $_ypos) + $_ymax * $_ypos) / 2;
  imagettftext(
    $_im, $_size, $_angle, $_x + $_dx, $_y + $_dy, $_color, $_fontfile, $_text
  );
}

$psfenw = $_GET['p'];

try {
  if (is_null($psfenw)) {
    throw new Exception("psfenw is null");
  }
  $shogi = Shogi::fromPsfenw($psfenw);
} catch (Exception $e) {
  header("Content-type: image/png");
  $im = imagecreatefrompng('img/error.png');
  imagepng($im);
  imagedestroy($im);
  goto endpoint;
}

header("Content-type: image/png");

$pta = [
  '0FU', '0KY', '0KE', '0GI', '0KI', '0KA', '0HI',
  '0OU', '0TO', '0NK', '0NY', '0NG', '0UM', '0RY',
  '1FU', '1KY', '1KE', '1GI', '1KI', '1KA', '1HI',
  '1OU', '1TO', '1NY', '1NK', '1NG', '1UM', '1RY',
  'blank',
];
// 駒画像
$ima = [];
foreach($pta as $pt)
{
  $ima[$pt] = imagecreatefrompng('img/pieces/' . $pt . '.png');
}

// 画像
$imx = 992; // 960 - 96;
$imy = 496; // 540 - 54;
$imxh = $imx / 2;
$imyh = $imy / 2;
//$im = imagecreatefrompng('img/denryu-board.png');
$im  = imagecreatetruecolor($imx, $imy);
// 白色
$wc = imagecolorallocate($im, 255, 255, 255);
// 黒色
$bc  = imagecolorallocate($im, 0, 0, 0);
// 盤色
$bgb = imagecolorallocate($im, 253, 215, 117);
// 強調升色
$emf = imagecolorallocate($im, 255, 153, 0);
$emt = imagecolorallocate($im, 0, 204, 153);

imagefilledrectangle($im, 0, 0, $imx, $imy, $bc);

// 盤
imagefilledrectangle($im, $imxh - 216, $imyh - 238, $imxh + 216, $imyh + 238, $bgb);
// 先手駒台
imagefilledrectangle($im, $imxh + 220, $imyh + 10, $imxh + 400, $imyh + 238, $bgb);
// 後手駒台
imagefilledrectangle($im, $imxh - 400, $imyh - 238, $imxh - 220, $imyh - 10, $bgb);

// 駒配置
$m = $shogi->move;
$fromf = NULL;
$fromr = NULL;
$tof = NULL;
$tor = NULL;
$mCol = NULL;
$mHit = NULL;
$mCap = NULL;

if (!empty($m)) {
  $mCol = $m["color"];
  $mCap = $m["capture"];
  if (!is_null($m["from"])) {
    $fromf = $m["from"]["f"];
    $fromr = $m["from"]["r"];
  } else {
    $mHit = $m["piece"];
  }
  if (!is_null($m["to"])) {
    $tof = $m["to"]["f"];
    $tor = $m["to"]["r"];
  }
}

for($f = 0; $f < 9; ++$f)
{
  for($r = 0; $r < 9; ++$r)
  {
    if ($fromf === $f && $fromr === $r)
    {
      imagefilledrectangle($im, (3.5 - $f) * 44 + $imxh, ($r - 4.5) * 49 + $imyh, (4.5 - $f) * 44 + $imxh, ($r - 3.5) * 49 + $imyh, $emf);
    }
    if ($tof === $f && $tor === $r)
    {
      imagefilledrectangle($im, (3.5 - $f) * 44 + $imxh, ($r - 4.5) * 49 + $imyh, (4.5 - $f) * 44 + $imxh, ($r - 3.5) * 49 + $imyh, $emt);
    }
    $p = $shogi->board[$f][$r];
    if (!is_null($p))
    {
      imagecopy($im, $ima[$p["color"] . $p["kind"]], (3.5 - $f) * 44 + $imxh, ($r - 4.5) * 49 + $imyh, 0, 0, 43, 48);
    }
  }
}

// 駒台配置
function handpieces($_im, $_x, $_y, $_pt, $_imp, $_num, $_em)
{
  if(!is_null($_em))
  {
    if($_pt === '0FU' || $_pt === '1FU')
    {
      imagefilledrectangle($_im, $_x, $_y, $_x + 160, $_y + 48, $_em);
    }
    else
    {
      imagefilledrectangle($_im, $_x, $_y, $_x + 80, $_y + 48, $_em);
    }
  }
  for($_i = $_num - 1; $_i >= 0; --$_i)
  {
    if($_pt === '0FU' || $_pt === '1FU')
    {
      imagecopy($_im, $_imp, $_x + ($_num < 4 ? $_i * 40 : ($_i / ($_num - 1)) * 116), $_y, 0, 0, 43, 48);
    }
    else
    {
      imagecopy($_im, $_imp, $_x + ($_num < 2 ? $_i * 40 : ($_i / ($_num - 1)) * 36), $_y, 0, 0, 43, 48);
    }
  }
}
function hand($im, $x, $y, $oa)
{
  $ix = 0;
  $iy = 0;
  foreach($oa as $o)
  {
    if(!is_null($o["em"]) || $o["num"] > 0) {
      if($ix > 0 && ($o["pt"] === '0FU' || $o["pt"] === '1FU'))
      {
        $ix = 0;
        $iy += 1;
      }
      handpieces($im, $x + $ix * 80, $y + $iy * 49, $o["pt"], $o["imp"], $o["num"], $o["em"]);
      $ix += ($o["pt"] === '0FU' || $o["pt"] === '1FU') ? 2 : 1;
      if($ix > 1)
      {
        $ix = 0;
        $iy += 1;
      }
    }
  }
}

hand($im, $imxh + 230, $imyh + 26, [
  [ "pt" => '0HI', "imp" => $ima['0HI'], "num" => $shogi->hands[0]["HI"], "em" => ($mCol !== 0 ? NULL : ($mHit === "HI" ? $emf : ($mCap === "HI" || $mCap === "RY" ? $emt : NULL))) ],
  [ "pt" => '0KA', "imp" => $ima['0KA'], "num" => $shogi->hands[0]["KA"], "em" => ($mCol !== 0 ? NULL : ($mHit === "KA" ? $emf : ($mCap === "KA" || $mCap === "UM" ? $emt : NULL))) ],
  [ "pt" => '0KI', "imp" => $ima['0KI'], "num" => $shogi->hands[0]["KI"], "em" => ($mCol !== 0 ? NULL : ($mHit === "KI" ? $emf : ($mCap === "KI" || $mCap === "KI" ? $emt : NULL))) ],
  [ "pt" => '0GI', "imp" => $ima['0GI'], "num" => $shogi->hands[0]["GI"], "em" => ($mCol !== 0 ? NULL : ($mHit === "GI" ? $emf : ($mCap === "GI" || $mCap === "NG" ? $emt : NULL))) ],
  [ "pt" => '0KE', "imp" => $ima['0KE'], "num" => $shogi->hands[0]["KE"], "em" => ($mCol !== 0 ? NULL : ($mHit === "KE" ? $emf : ($mCap === "KE" || $mCap === "NK" ? $emt : NULL))) ],
  [ "pt" => '0KY', "imp" => $ima['0KY'], "num" => $shogi->hands[0]["KY"], "em" => ($mCol !== 0 ? NULL : ($mHit === "KY" ? $emf : ($mCap === "KY" || $mCap === "NY" ? $emt : NULL))) ],
  [ "pt" => '0FU', "imp" => $ima['0FU'], "num" => $shogi->hands[0]["FU"], "em" => ($mCol !== 0 ? NULL : ($mHit === "FU" ? $emf : ($mCap === "FU" || $mCap === "TO" ? $emt : NULL))) ],
]);
$handf = rand(0, 6);
$handt = ($handf + rand(1, 6)) % 7;
hand($im, $imxh - 390, $imyh - 220, [
  [ "pt" => '1FU', "imp" => $ima['1FU'], "num" => $shogi->hands[1]["FU"], "em" => ($mCol !== 1 ? NULL : ($mHit === "FU" ? $emf : ($mCap === "FU" || $mCap === "TO" ? $emt : NULL))) ],
  [ "pt" => '1KY', "imp" => $ima['1KY'], "num" => $shogi->hands[1]["KY"], "em" => ($mCol !== 1 ? NULL : ($mHit === "KY" ? $emf : ($mCap === "KY" || $mCap === "NY" ? $emt : NULL))) ],
  [ "pt" => '1KE', "imp" => $ima['1KE'], "num" => $shogi->hands[1]["KE"], "em" => ($mCol !== 1 ? NULL : ($mHit === "KE" ? $emf : ($mCap === "KE" || $mCap === "NK" ? $emt : NULL))) ],
  [ "pt" => '1GI', "imp" => $ima['1GI'], "num" => $shogi->hands[1]["GI"], "em" => ($mCol !== 1 ? NULL : ($mHit === "GI" ? $emf : ($mCap === "GI" || $mCap === "NG" ? $emt : NULL))) ],
  [ "pt" => '1KI', "imp" => $ima['1KI'], "num" => $shogi->hands[1]["KI"], "em" => ($mCol !== 1 ? NULL : ($mHit === "KI" ? $emf : ($mCap === "KI" || $mCap === "KI" ? $emt : NULL))) ],
  [ "pt" => '1KA', "imp" => $ima['1KA'], "num" => $shogi->hands[1]["KA"], "em" => ($mCol !== 1 ? NULL : ($mHit === "KA" ? $emf : ($mCap === "KA" || $mCap === "UM" ? $emt : NULL))) ],
  [ "pt" => '1HI', "imp" => $ima['1HI'], "num" => $shogi->hands[1]["HI"], "em" => ($mCol !== 1 ? NULL : ($mHit === "HI" ? $emf : ($mCap === "HI" || $mCap === "RY" ? $emt : NULL))) ],
]);

// 罫線
$x0 = $imxh - 4.5 * 44;
$x1 = $imxh + 4.5 * 44;
$y0 = $imyh - 4.5 * 49;
$y1 = $imyh + 4.5 * 49;
for($i = 0; $i <= 9; ++$i)
{
  $x = $imxh + ($i - 4.5) * 44;
  $y = $imyh + ($i - 4.5) * 49;
  imageline($im, $x, $y0, $x, $y1, $bc);
  imageline($im, $x0, $y, $x1, $y, $bc);
}

for($i = 0; $i < 9; ++$i)
{
  $x = $imxh - ($i - 4) * 44;
  $y = $imyh + ($i - 4) * 49;
  aligntext(
    $im, 10, 0, $x, $imyh - 229, $bc, $font4,
    ['１','２','３','４','５','６','７','８','９'][$i]
  );
  aligntext(
    $im, 10, 0, $imxh + 207, $y, $bc, $font4,
    ['一','二','三','四','五','六','七','八','九'][$i]
  );
}

$moveStr = $shogi->toMoveStr();
if (!empty($moveStr)) {
  imagefilledrectangle($im, $imxh + 220, 30, $imxh + 420, 150, $wc);
  aligntext($im, 16, 0, $imxh + 320,  64, $bc, $font7, $shogi->tesuu .'手目', 1, 1);
  aligntext($im, 16, 0, $imxh + 320,  90, $bc, $font7, $shogi->toMoveStr(), 1, 1);
  aligntext($im, 16, 0, $imxh + 320, 116, $bc, $font7, 'まで', 1, 1);
}

//$logo = imagecreatefromjpeg('img/denryu-sen-logo-small.jpg');
//imagecopyresampled($im, $logo, 0, $imyh + 238 - ($imxh - 220) / 3, 0, 0, $imxh - 220, ($imxh - 220) / 3, 300, 100);

//imagesavealpha($im, true);
imagepng($im);
imagedestroy($im);

endpoint:

?>

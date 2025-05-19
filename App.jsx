import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const PIXABAY_API_KEY = '・・・・・・・・・'; // ←キーを入れる

function App() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // CSVファイルを読み込む
  useEffect(() => {
    Papa.parse('/prefectures.csv', {
      download: true,
      header: true,
      complete: (result) => {
        try {
          const parsed = result.data.map(item => ({
            name: item.name,
            keyword: item.keyword,
            spots: JSON.parse(item.spots)
          }));
          setData(parsed);
        } catch (error) {
          console.error("CSV解析エラー:", error);
        }
      }
    });
  }, []);

  // Pixabayで画像を取得
  const getPixabayImage = async (query) => {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`
    );
    const data = await response.json();
    return data.hits[0]?.webformatURL || null;
  };

  // ランダムに都道府県と観光地を選び、画像取得
  const pickRandom = async () => {
    if (data.length === 0) return;
    const randomPref = data[Math.floor(Math.random() * data.length)];
    const randomSpot = randomPref.spots[Math.floor(Math.random() * randomPref.spots.length)];
    const image = await getPixabayImage(randomSpot);

    setSelected({
      ...randomPref,
      spot: randomSpot
    });
    setImageUrl(image);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>ランダム旅行先＆観光名所</h1>
      <button onClick={pickRandom} style={{ padding: '0.5rem 1.5rem' }}>
        行き先を選ぶ
      </button>

      {selected && (
        <div style={{ marginTop: '2rem' }}>
          <h2>{selected.name}</h2>
          <h3>観光名所：{selected.spot}</h3>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={selected.spot}
              style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '10px' }}
            />
          ) : (
            <p>画像が見つかりませんでした。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;


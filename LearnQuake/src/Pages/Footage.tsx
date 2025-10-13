import { useState, useEffect } from "react";
import Header from "../components/Header";
import FootageModal from "../components/ui/footageModal";
import { fetchEarthquakeFootage } from "../services/footageApi";
import type { FootageItem } from "../services/footageApi";

export default function Footage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [footage, setFootage] = useState<FootageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFootage();
  }, []);

  const loadFootage = async () => {
    setLoading(true);
    try {
      const items = await fetchEarthquakeFootage("PH", 9);
      setFootage(items);
    } catch (error) {
      console.error("Failed to fetch earthquake footage:", error);
      setFootage([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (card: any) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-4">Earthquake Footage Library</h1>
        <p className="text-gray-600 mb-8">
          Watch verified earthquake videos captured across the Philippines.
        </p>

        <section>
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={loadFootage}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading earthquake footage...</p>
            </div>
          ) : footage.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No earthquake videos available right now. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {footage.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col cursor-pointer"
                  onClick={() =>
                    openModal({
                      title: item.title,
                      date: new Date(item.publishedAt).toLocaleDateString(),
                      location: item.channel,
                      modalContent: (
                        <div>
                          <iframe
                            src={`https://www.youtube.com/embed/${item.id}`}
                            title={item.title}
                            className="w-full h-56 rounded-lg mb-4"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <p className="text-sm text-gray-700 mb-4">
                            {item.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            Channel: {item.channel} •{" "}
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ),
                    })
                  }
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{item.channel}</p>
                  <h3 className="text-base font-semibold mt-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3 flex-grow">
                    {item.description}
                  </p>

                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                    Watch Video
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedCard && (
        <FootageModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={selectedCard.title}
          description={
            selectedCard.location
              ? `${selectedCard.date} • ${selectedCard.location}`
              : selectedCard.date
          }
          content={selectedCard.modalContent}
        />
      )}
    </div>
  );
}

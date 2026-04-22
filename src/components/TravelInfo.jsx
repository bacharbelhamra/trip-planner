function TravelInfo({ days, budget, travelers }) {

  return (
    <div className="flex gap-4 mb-10">

      <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">
        📅 {days} Days
      </span>

      <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">
        💰 {budget} Budget
      </span>

      <span className="bg-gray-100 px-4 py-2 rounded-full text-sm">
        👥 {travelers}
      </span>

    </div>
  );
}

export default TravelInfo;
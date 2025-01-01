import "./styles.css";
import { useState, useRef, useEffect } from "react";

const meetings = [
  { name: "Meeting 1", time: "9:10-10:30" },
  { name: "Meeting 2", time: "10:15-12:40" },
  { name: "Meeting 3", time: "13:30-15:40" },
  { name: "Meeting 4", time: "13:30-15:40" },
];

export default function App() {
  const meetingRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState("Overlapping");
  const [meetingPositions, setMeetingPositions] = useState([]);

  const handleChange = (event) => setSelectedOption(event.target.value);
  let renderedMeetings = [];

  const timeRange = Array.from({ length: 13 }, (_, index) =>
    index + 8 > 12 ? `${index + 8 - 12} pm` : `${index + 8} am`
  );

  const getStartEndTime = (time) => {
    let startTimeonScreen = time.split("-")[0].split(":");
    let endTimeOnScreen = time.split("-")[1].split(":");

    return { startTimeonScreen, endTimeOnScreen };
  };

  const checkOverLap = (startTime, endTime) => {
    let count = 0;
    if (renderedMeetings.length) {
      for (const meeting of renderedMeetings) {
        let { startTimeonScreen, endTimeOnScreen } = getStartEndTime(meeting);
        let endTimeOnScreenReplace = Number(endTimeOnScreen.join("."));
        let targetStartTime = Number(startTime.join("."));
        let targetEndTime = Number(endTime.join("."));

        let isColliding =
          endTimeOnScreenReplace >= targetStartTime &&
          endTimeOnScreenReplace <= targetEndTime;
        if (isColliding) {
          count++;
        }
      }
    }
    return count;
  };

  const calculatePosition = (meeting, dimensions) => {
    let width = dimensions.width;
    let height = dimensions.height;
    let time = meeting.time;
    let { startTimeonScreen, endTimeOnScreen } = getStartEndTime(time);
    let top =
      (Number(startTimeonScreen[0]) - 8) * (height / 12) +
      (Number(startTimeonScreen[1]) / 5 / 100) * (height / 12);

    let bottom =
      (Number(endTimeOnScreen[0]) - 8) * (height / 12) +
      (Number(endTimeOnScreen[1]) / 5 / 100) * (height / 12);
    let newHeight = bottom - top;
    let overLapCount = checkOverLap(startTimeonScreen, endTimeOnScreen);
    let left = overLapCount ? width / (overLapCount + 1) : 0;
    let newWidth = overLapCount ? `${width / (overLapCount + 1)}px` : "100%";

    return { top, newHeight, left, newWidth };
  };

  useEffect(() => {
    const elem = meetingRef.current;
    if (elem) {
      const dimensions = elem.getBoundingClientRect();
      console.log("dimensions", dimensions);

      // Calculate positions of all meetings and update the state
      const newMeetingPositions = meetings.map((meeting) => {
        const position = calculatePosition(meeting, dimensions);
        renderedMeetings.push(meeting.time);
        return position;
      });

      setMeetingPositions(newMeetingPositions);
    }
  }, [meetings]); // Recalculate positions if meetings change

  return (
    <div className="App">
      <div className="checkboxes">
        {["Overlapping", "Slotted"].map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="options"
              value={option}
              checked={selectedOption === option}
              onChange={handleChange}
            />
            {option}
          </label>
        ))}
      </div>

      <div className="outer-parent">
        <div className="calender-container">
          {timeRange.map((time) => (
            <div key={time} className="time-container">
              <div className="time">{time}</div>
              <hr className="hr" />
            </div>
          ))}
        </div>

        {/* Render meetings directly within meetings-container */}
        <div ref={meetingRef} className="meetings-container">
          {meetingPositions.map((position, index) => {
            const meeting = meetings[index];
            return (
              <div
                key={index}
                className="meetinginidv"
                style={{
                  top: `${position.top}px`,
                  height: `${position.newHeight}px`,
                  left: `${position.left}px`,
                  width: position.newWidth,
                  position: "absolute", // Positioning meetings inside the container
                }}
              >
                {meeting.name} {/* You can add more content here */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

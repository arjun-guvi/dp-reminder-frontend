import './loadingScreen.scss';

const LoadingScreen = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`loading-screen ${fullScreen ? 'loading-screen--full' : ''}`}>
      <div className="loading-screen__content">
        <div className="loading-screen__spinner"></div>
        <p className="loading-screen__message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

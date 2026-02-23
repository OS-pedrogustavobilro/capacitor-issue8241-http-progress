import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonProgressBar, IonText } from '@ionic/react';
import { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [xhrProgress, setXhrProgress] = useState<number>(0);
  const [xhrStatus, setXhrStatus] = useState<string>('Ready');
  const [fetchProgress, setFetchProgress] = useState<number>(0);
  const [fetchStatus, setFetchStatus] = useState<string>('Ready');

  const createTestFile = (sizeInMB: number = 5): File => {
    const size = sizeInMB * 1024 * 1024;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return new File([blob], 'test-file.bin', { type: 'application/octet-stream' });
  };

  const testXMLHttpRequest = () => {
    setXhrProgress(0);
    setXhrStatus('Starting XMLHttpRequest...');

    const file = createTestFile(5);
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setXhrProgress(percentComplete);
        setXhrStatus(`XMLHttpRequest uploading: ${percentComplete.toFixed(2)}%`);
        console.log(`XMLHttpRequest progress: ${event.loaded} / ${event.total} (${percentComplete.toFixed(2)}%)`);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setXhrStatus(`XMLHttpRequest completed successfully! Status: ${xhr.status}`);
      } else {
        setXhrStatus(`XMLHttpRequest failed with status: ${xhr.status}`);
      }
    });

    xhr.addEventListener('error', () => {
      setXhrStatus('XMLHttpRequest error occurred');
      console.error('XMLHttpRequest error');
    });

    xhr.addEventListener('abort', () => {
      setXhrStatus('XMLHttpRequest aborted');
    });

    xhr.open('POST', 'https://httpbin.org/post');
    xhr.send(formData);
  };

  const testFetchAPI = async () => {
    setFetchProgress(0);
    setFetchStatus('Starting Fetch API...');

    const file = createTestFile(5);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setFetchProgress(percentComplete);
          setFetchStatus(`Fetch API uploading: ${percentComplete.toFixed(2)}%`);
          console.log(`Fetch API progress: ${event.loaded} / ${event.total} (${percentComplete.toFixed(2)}%)`);
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText
            }));
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Request aborted')));

        xhr.open('POST', 'https://httpbin.org/post');
        xhr.send(formData);
      });

      setFetchStatus(`Fetch API completed successfully! Status: ${response.status}`);
    } catch (error) {
      setFetchStatus(`Fetch API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Fetch API error:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>HTTP Upload Progress Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">HTTP Upload Progress Test</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '16px' }}>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Issue #8241: Upload Progress Events</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>This app demonstrates the issue where upload progress events don't fire when the Capacitor HTTP plugin is enabled.</p>
                <p>Each test uploads a 5MB file to httpbin.org and tracks progress.</p>
                <p><strong>Expected:</strong> Progress events should fire and show upload progress.</p>
                <p><strong>Actual (with Capacitor HTTP):</strong> Progress events may not fire.</p>
              </IonText>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>XMLHttpRequest Test</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton expand="block" onClick={testXMLHttpRequest}>
                Test XMLHttpRequest Upload
              </IonButton>
              <div style={{ marginTop: '16px' }}>
                <IonText>
                  <p><strong>Status:</strong> {xhrStatus}</p>
                </IonText>
                <IonProgressBar value={xhrProgress / 100} />
                <IonText>
                  <p style={{ textAlign: 'center', marginTop: '8px' }}>{xhrProgress.toFixed(2)}%</p>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Fetch API Test (with XHR progress)</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton expand="block" onClick={testFetchAPI}>
                Test Fetch API Upload
              </IonButton>
              <div style={{ marginTop: '16px' }}>
                <IonText>
                  <p><strong>Status:</strong> {fetchStatus}</p>
                </IonText>
                <IonProgressBar value={fetchProgress / 100} />
                <IonText>
                  <p style={{ textAlign: 'center', marginTop: '8px' }}>{fetchProgress.toFixed(2)}%</p>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Instructions</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <ol>
                  <li>Test in a web browser first or setting CapacitorHttp enabled to false in `capacitor.config.ts`(progress should work)</li>
                  <li>Build and run on iOS/Android with Capacitor HTTP plugin enabled</li>
                  <li>Observe if progress events fire or not</li>
                  <li>Check browser console for progress log messages</li>
                </ol>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;

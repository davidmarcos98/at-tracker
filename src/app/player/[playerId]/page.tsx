'use client';

import { SVGProps, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardBody,
  Spinner,
  Progress,
  Link
} from '@heroui/react';
import MapsTable from '@/src/app/components/MapsTable';
import { JSX } from 'react/jsx-runtime';

export const AnchorIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="-10px" width="28" height="28" viewBox="0 15 75 75">
        <path fill="currentColor" d="M 43 12 C 40.791 12 39 13.791 39 16 C 39 18.209 40.791 20 43 20 L 46.34375 20 L 35.171875 31.171875 C 33.609875 32.733875 33.609875 35.266125 35.171875 36.828125 C 35.951875 37.608125 36.977 38 38 38 C 39.023 38 40.048125 37.608125 40.828125 36.828125 L 52 25.65625 L 52 29 C 52 31.209 53.791 33 56 33 C 58.209 33 60 31.209 60 29 L 60 16 C 60 13.791 58.209 12 56 12 L 43 12 z M 23 14 C 18.037 14 14 18.038 14 23 L 14 49 C 14 53.962 18.037 58 23 58 L 49 58 C 53.963 58 58 53.962 58 49 L 58 41 C 58 38.791 56.209 37 54 37 C 51.791 37 50 38.791 50 41 L 50 49 C 50 49.551 49.552 50 49 50 L 23 50 C 22.448 50 22 49.551 22 49 L 22 23 C 22 22.449 22.448 22 23 22 L 31 22 C 33.209 22 35 20.209 35 18 C 35 15.791 33.209 14 31 14 L 23 14 z"></path>
    </svg>
  );
};

interface PlayerMap {
  mapUid: string;
  mapId: string;
  name: string;
  author: string;
  medalAuthor: number;
  medalGold: number;
  medalSilver: number;
  medalBronze: number;
  year: number;
  month: number;
  day: number;
  isTotd: boolean;
  totdDate?: string;
  atCount: number;
  thumbnailUrl?: string;
  entryId?: number;
  time?: number;
  rank?: number;
  date?: string;
  isAt?: boolean;
}

interface PlayerData {
  displayName: string;
  accountId: string;
  atCount: number;
}

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [maps, setMaps] = useState<PlayerMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerRank, setPlayerRank] = useState(0);
  const [totalMaps, setTotalMaps] = useState(0);

  useEffect(() => {
    // No need for theme detection with HeroUI as it handles it automatically
  }, []);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/player/${playerId}`);
        const result = await response.json();

        if (result.success) {
          setPlayer(result.player);
          setMaps(result.maps || []);
          setPlayerRank(result.playerRank);
          setTotalMaps(result.totalMaps);
        }
      } catch (error) {
        console.error('Failed to fetch player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  const completedMaps = maps.filter((m) => m.isAt).length;
  const missingMaps = maps.length - completedMaps;

  return (
    <div className="w-[98%] md:w-[80%] p-4 min-h-screen" style={{ margin: 'auto' }}>
    {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
        </div>
    ) : player ? (
        <div className="mb-[50px]">
            <Card className="mb-3 mt-4">
                <CardBody className="p-4">
                <div className="block md:grid grid-cols-1 md:grid-cols-8 gap-4">
                    <h1 className="font-bold h-[fit-content] align-center md:align-left w-fit md:w-full md:col-span-4" style={{ margin: 'auto' }}>
                        { (player.displayName) ? 
                            <Link style={{ margin: '0 auto' }} isBlock color='foreground' isExternal showAnchorIcon anchorIcon={<AnchorIcon />} href={`https://trackmania.io/#/player/${player.accountId}`}>
                                <p className='text-5xl'>{player.displayName}</p>
                            </Link> :
                            'Unknown Player'
                        }
                    </h1>
                    <Card isBlurred className="bg-default-100 outline-white mt-6 md:mt-0 md:col-span-2" radius="md">
                        <CardBody className='grid md:inline-flex grid-cols-2'>
                          <div className='align-center'>
                            <p className="text-sm text-default-500 text-center md:text-left">Leaderboard Rank</p>
                            <p className="text-2xl font-bold text-center md:text-left">#{playerRank}</p>
                          </div>
                          <div>
                            <p className="text-sm text-default-500 text-center md:text-left">Missing maps</p>
                            <p className="text-2xl font-bold text-center md:text-left">{missingMaps}</p>
                          </div>
                        </CardBody>
                    </Card>

                    <Card isBlurred className="bg-default-100 outline-green-400 mt-6 md:mt-0 md:col-span-2" radius="md">
                        <CardBody>
                            <p className="text-sm text-default-500 text-center md:text-left">Maps Progress</p>
                            <p className="text-2xl font-bold text-center md:text-left">
                                {completedMaps}/{totalMaps}
                            </p>
                            <Progress aria-label="Loading..." color="success" className='pt-2 md:pt-[10%]' style={{ margin: 'auto' }} value={completedMaps*100/totalMaps} />
                        </CardBody>
                    </Card>
                </div>
                </CardBody>
            </Card>

            <MapsTable maps={maps}/>
        </div>
    ) : (
        <Card className="p-6 text-center">
        <CardBody>
            <p className="text-lg text-red-500">Player not found</p>
        </CardBody>
        </Card>
    )}
    </div>
  );
}

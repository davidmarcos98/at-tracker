'use client';

import { SVGProps, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  Button,
  Spinner,
  Progress,
  Pagination,
  Link,
  Image,
  Code
} from '@heroui/react';
import { JSX } from 'react/jsx-runtime';

export const AnchorIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="-10px" width="28" height="28" viewBox="0 15 75 75">
        <path fill="currentColor" d="M 43 12 C 40.791 12 39 13.791 39 16 C 39 18.209 40.791 20 43 20 L 46.34375 20 L 35.171875 31.171875 C 33.609875 32.733875 33.609875 35.266125 35.171875 36.828125 C 35.951875 37.608125 36.977 38 38 38 C 39.023 38 40.048125 37.608125 40.828125 36.828125 L 52 25.65625 L 52 29 C 52 31.209 53.791 33 56 33 C 58.209 33 60 31.209 60 29 L 60 16 C 60 13.791 58.209 12 56 12 L 43 12 z M 23 14 C 18.037 14 14 18.038 14 23 L 14 49 C 14 53.962 18.037 58 23 58 L 49 58 C 53.963 58 58 53.962 58 49 L 58 41 C 58 38.791 56.209 37 54 37 C 51.791 37 50 38.791 50 41 L 50 49 C 50 49.551 49.552 50 49 50 L 23 50 C 22.448 50 22 49.551 22 49 L 22 23 C 22 22.449 22.448 22 23 22 L 31 22 C 33.209 22 35 20.209 35 18 C 35 15.791 33.209 14 31 14 L 23 14 z"></path>
    </svg>
  );
};
const { tmText } = require('tm-text');

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

interface SortDescriptor {
  column: string;
  direction: 'ascending' | 'descending';
}

export default function PlayerPage() {
  const params = useParams();
  const playerId = params.playerId as string;

  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [maps, setMaps] = useState<PlayerMap[]>([]);
  const [filteredMaps, setFilteredMaps] = useState<PlayerMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [playerRank, setPlayerRank] = useState(0);
  const [totalMaps, setTotalMaps] = useState(0);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  useEffect(() => {
    let filtered = maps;

    if (filter === 'complete') {
      filtered = maps.filter((map) => map.isAt);
    } else if (filter === 'incomplete') {
      filtered = maps.filter((map) => !map.isAt);
    }

    // Sort the filtered maps
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortDescriptor.column) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'date':
          aValue = new Date(a.year, a.month - 1, a.day).getTime();
          bValue = new Date(b.year, b.month - 1, b.day).getTime();
          break;
        case 'authorTime':
          aValue = a.medalAuthor;
          bValue = b.medalAuthor;
          break;
        case 'time':
          aValue = a.time ?? Infinity;
          bValue = b.time ?? Infinity;
          break;
        case 'atcount':
          aValue = a.atCount;
          bValue = b.atCount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortDescriptor.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDescriptor.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    setFilteredMaps(sorted);
  }, [filter, maps, sortDescriptor]);

  const completedMaps = maps.filter((m) => m.isAt).length;
  const missingMaps = maps.length - completedMaps;

  // Pagination logic
  const totalPages = Math.ceil(filteredMaps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMaps = filteredMaps.slice(startIndex, endIndex);

  function parseTime(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  function parseTimeDifference(time: number) {
    const seconds = Math.floor(time / 1000);
    const millis = time % 1000;
    const secs = seconds % 60;

    return `${String(secs).padStart(1, '0')}.${String(millis).padStart(3, '0')}`;
  }

  return (
    <div className="w-[75%] p-4 min-h-screen" style={{ margin: 'auto' }}>
    {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
            <Spinner />
        </div>
    ) : player ? (
        <div className="mb-[50px]">
            <Card className="mb-3 mt-4">
                <CardBody className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <h1 className="font-bold h-[fit-content] align-left w-[100%] col-span-3" style={{ margin: 'auto' }}>
                        { (player.displayName) ? 
                            <Link isBlock color='foreground' isExternal showAnchorIcon anchorIcon={<AnchorIcon />} href={`https://trackmania.io/#/player/${player.accountId}`}>
                                <p className='text-5xl'>{player.displayName}</p>
                            </Link> :
                            'Unknown Player'
                        }
                    </h1>
                    <Card isBlurred className="bg-default-100 outline-white" radius="md">
                        <CardBody>
                            <p className="text-sm text-default-500">Missing maps</p>
                            <p className="text-2xl font-bold">{missingMaps}</p>
                            <p className="text-sm text-default-500">Leaderboard Rank</p>
                            <p className="text-2xl font-bold">#{playerRank}</p>
                        </CardBody>
                    </Card>

                    <Card isBlurred className="bg-default-100 outline-green-400" radius="md">
                        <CardBody>
                            <p className="text-sm text-default-500">Maps Progress</p>
                            <p className="text-2xl font-bold">
                                {completedMaps}/{totalMaps}
                            </p>
                            <Progress aria-label="Loading..." color="success" style={{ margin: 'auto', paddingTop: '10%'}} value={completedMaps*100/totalMaps} />
                        </CardBody>
                    </Card>
                </div>
                </CardBody>
            </Card>

            {/* <div>
                <div className="flex justify-end gap-3 items-center">
                    <RadioGroup label="" value={filter} onValueChange={setFilter} orientation="horizontal">
                        <Radio value="all">All</Radio>
                        <Radio value="complete">Complete</Radio>
                        <Radio value="incomplete">Incomplete</Radio>
                    </RadioGroup>
                </div>
                <div className="flex justify-end gap-3 items-center mb-6">{filter == 'all' ? maps.length : (filter == 'complete' ? completedMaps : missingMaps)} matches</div>
            </div> */}

            <div className="flex justify-end gap-2 items-center mb-3">
                <Button
                    size="md"
                    variant={filter === 'all' ? 'solid' : 'ghost'}
                    onPress={() => setFilter('all')}
                >
                    All ({maps.length})
                </Button>
                <Button
                    size="md"
                    variant={filter === 'complete' ? 'solid' : 'ghost'}
                    onPress={() => setFilter('complete')}
                >
                    Complete ({completedMaps})
                </Button>
                <Button
                    size="md"
                    variant={filter === 'incomplete' ? 'solid' : 'ghost'}
                    onPress={() => setFilter('incomplete')}
                >
                    Incomplete ({missingMaps})
                </Button>
            </div>

            <Table
                aria-label="Player maps table"
                sortDescriptor={sortDescriptor}
                onSortChange={(descriptor: any) => {
                    setSortDescriptor({
                        column: descriptor.column,
                        direction: descriptor.direction,
                    });
                    setCurrentPage(1); // Reset to first page when sorting
                }}
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={currentPage}
                            total={totalPages}
                            onChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                }
            >
                <TableHeader>
                    <TableColumn key="name" allowsSorting className='text-sm font-bold'>
                        Map Name
                    </TableColumn>
                    <TableColumn key="atcount" allowsSorting maxWidth={3} align='center' className='text-sm font-bold'>
                        AT Count
                    </TableColumn>
                    <TableColumn key="date" allowsSorting maxWidth={5} align='center' className='text-sm font-bold'>
                        Date
                    </TableColumn>
                    <TableColumn key="authorTime" allowsSorting maxWidth={5} align='center' className='text-sm font-bold'>
                        Author Time
                    </TableColumn>
                    <TableColumn key="time" allowsSorting width={"15%"} align='center' className='text-sm font-bold'>
                        Time
                    </TableColumn>
                </TableHeader>
                <TableBody items={paginatedMaps} emptyContent="No maps found">
                    {(item) => (
                        <TableRow key={item.mapUid}>
                            <TableCell>
                                <Link isBlock color='foreground' isExternal showAnchorIcon href={`https://trackmania.io/#/leaderboard/${item.mapUid}`}>
                                    <div
                                        className='text-lg'
                                        dangerouslySetInnerHTML={{
                                        __html: tmText(item.name).htmlify(),
                                        }}
                                    />
                                </Link>
                            </TableCell>
                            <TableCell className='text-md'>
                                {item.atCount}
                            </TableCell>
                            <TableCell>
                                <Code size="sm">
                                    {String(item.day).padStart(2, '0')}/{String(item.month).padStart(2, '0')}/{item.year}
                                </Code>
                            </TableCell>
                            <TableCell className='text-md'>{parseTime(item.medalAuthor)}</TableCell>
                            <TableCell className='inline-flex items-center gap-2 text-md'>
                                <Image src={item.isAt ? "/medal_author.png" : (item.time == null || item.time == undefined ? "/medal_none.png" : "/medal_gold.png")} width={28}></Image>
                                {item.time === null || item.time === undefined
                                ? 'Not played'
                                : `${parseTime(item.time)} (${
                                    item.time - item.medalAuthor > 0 ? '+' : '-'
                                    }${parseTimeDifference(Math.abs(item.time - item.medalAuthor))})`}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
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

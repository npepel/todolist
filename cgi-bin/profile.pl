#!/usr/bin/perl

use strict;
use warnings;
use utf8;

use CGI;
use CGI::Carp 'fatalsToBrowser';
use DBI;
use Data::Dumper;

use lib "/home/nina/perl5/lib/perl5";
use JSON;

my $cgi = CGI->new;
my $user_id = $cgi->param("id");

my $dbh = DBI->connect("DBI:mysql:database=todolist;host=localhost;port=3306",  
  "user", "password") 
  or die $DBI::errstr;

$dbh->do(qq{SET NAMES 'utf8'}) or die $dbh->errstr;

my $statement = qq{SELECT * FROM profiles WHERE user_id=?};
my $sth = $dbh->prepare($statement)
  or die $dbh->errstr;
$sth->execute($user_id)
  or die $sth->errstr;
my $hash_result = $sth->fetchall_hashref('list_id');

my $json = eval { JSON->new->encode($hash_result) };

print $cgi->header(-type => "application/json", -charset => "utf-8");
print $json;